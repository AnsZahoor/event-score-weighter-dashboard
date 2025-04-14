
import { RawEvent } from "../types/event";
import { storeEvents } from "./eventStorage";

// Base URL for the myfxbook Calendar API
const API_BASE_URL = "https://www.myfxbook.com/calendar_statement.json";

/**
 * Fetch economic events from myfxbook Calendar API
 * 
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Promise with array of raw events
 */
export const fetchEvents = async (
  startDate: string,
  endDate: string
): Promise<RawEvent[]> => {
  console.log(`Fetching events from ${startDate} to ${endDate}`);
  
  try {
    // Construct URL with query parameters
    const url = `${API_BASE_URL}?start=${startDate}&end=${endDate}`;
    
    // Fetch data from API
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    // Parse response JSON
    const data = await response.json();
    
    // For development or if API returns no data, use mock data
    const events = (!data || !Array.isArray(data) || data.length === 0 || process.env.NODE_ENV === "development")
      ? generateMockEvents(startDate, endDate)
      : data as RawEvent[];
    
    console.log(`Retrieved ${events.length} events, storing in Supabase`);
    
    // Store events in Supabase
    await storeEvents(events);
    
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    const mockEvents = generateMockEvents(startDate, endDate);
    console.log(`Generated ${mockEvents.length} mock events as fallback`);
    
    // Still try to store mock events
    try {
      await storeEvents(mockEvents);
    } catch (storeError) {
      console.error("Failed to store mock events:", storeError);
    }
    
    return mockEvents;
  }
};

/**
 * Generate mock events for development and testing
 */
export const generateMockEvents = (startDate: string, endDate: string): RawEvent[] => {
  console.log(`Generating mock events from ${startDate} to ${endDate}`);
  const events: RawEvent[] = [];
  const currencies = ["USD", "EUR", "GBP", "JPY", "CHF"];
  const eventTypes = ["CPI", "GDP", "Unemployment Rate", "Retail Sales", "Interest Rate Decision"];
  const impacts = ["Low", "Medium", "High"];
  
  // Parse start and end dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Generate events for each day in the range
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dateStr = day.toISOString().split("T")[0];
    
    // Generate 1-3 events per day
    const eventsPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < eventsPerDay; i++) {
      const currency = currencies[Math.floor(Math.random() * currencies.length)] as "USD" | "EUR" | "GBP" | "JPY" | "CHF";
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const impact = impacts[Math.floor(Math.random() * impacts.length)] as "Low" | "Medium" | "High";
      
      // Generate random values for previous, forecast and actual
      const previousBase = parseFloat((Math.random() * 5).toFixed(1));
      const forecastDiff = parseFloat((Math.random() * 0.4 - 0.2).toFixed(1));
      const actualDiff = parseFloat((Math.random() * 0.6 - 0.3).toFixed(1));
      
      const previous = previousBase.toString();
      const forecast = (previousBase + forecastDiff).toFixed(1);
      const actual = (previousBase + forecastDiff + actualDiff).toFixed(1);
      
      // Generate random time for the event
      const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
      const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      
      events.push({
        id: `mock-${dateStr}-${i}`,
        country: currency === "USD" ? "United States" : 
                 currency === "EUR" ? "Euro Zone" : 
                 currency === "GBP" ? "United Kingdom" : 
                 currency === "JPY" ? "Japan" : "Switzerland",
        currency,
        title: eventType,
        date: dateStr,
        time,
        impact,
        previous,
        forecast,
        actual,
      });
    }
  }
  
  console.log(`Generated ${events.length} mock events`);
  return events;
};
