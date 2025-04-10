
import { RawEvent } from "../types/event";
import { fetchEventsFromSupabase, seedInitialEvents } from "../lib/supabase";

// Base URL for the myfxbook Calendar API (kept for reference or fallback)
const API_BASE_URL = "https://www.myfxbook.com/calendar_statement.json";

/**
 * Fetch economic events from Supabase database
 * Falls back to mock data if needed
 * 
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Promise with array of raw events
 */
export const fetchEvents = async (
  startDate: string,
  endDate: string
): Promise<RawEvent[]> => {
  try {
    // Try to fetch from Supabase
    const events = await fetchEventsFromSupabase(startDate, endDate);
    
    // If we got events from Supabase, return them
    if (events && events.length > 0) {
      return events;
    }
    
    // If no events from Supabase, generate mock data
    const mockEvents = generateMockEvents(startDate, endDate);
    
    // Seed the mock events into Supabase for future use
    try {
      await seedInitialEvents(mockEvents);
    } catch (err) {
      console.error("Failed to seed initial events:", err);
    }
    
    return mockEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return generateMockEvents(startDate, endDate);
  }
};

/**
 * Generate mock events for development and testing
 */
export const generateMockEvents = (startDate: string, endDate: string): RawEvent[] => {
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
  
  return events;
};
