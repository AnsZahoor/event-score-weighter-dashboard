
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RawEvent, TransformedEvent, EventFilters, CurrencyType, ChartDataPoint } from '../types/event';
import { fetchEvents } from '../services/api';
import { transformEvent, recalculateWeightedScore } from '../services/scoreCalculator';
import { formatDateString, getDateDaysAgo, groupEventsByDate } from '../utils/dateUtils';
import { toast } from "../components/ui/use-toast";
import { fetchStoredEvents } from '../services/eventStorage';

interface EventContextProps {
  rawEvents: RawEvent[];
  transformedEvents: TransformedEvent[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;
  updateFilters: (newFilters: Partial<EventFilters>) => void;
  updateEventWeight: (eventId: string, newWeight: number) => void;
  refreshData: () => Promise<void>;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
}

export const EventProvider: React.FC<EventProviderProps> = ({ children }) => {
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [transformedEvents, setTransformedEvents] = useState<TransformedEvent[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default filters: last 30 days, all currencies
  const [filters, setFilters] = useState<EventFilters>({
    startDate: formatDateString(getDateDaysAgo(30)),
    endDate: formatDateString(new Date()),
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CHF'],
  });

  // Determine if we're in a browser environment
  const isBrowser = typeof window !== 'undefined' && typeof process === 'undefined';

  // Load events when filters change
  useEffect(() => {
    loadEvents();
  }, [filters.startDate, filters.endDate, filters.currencies]);

  // Transform raw events into chart data
  useEffect(() => {
    if (transformedEvents.length > 0) {
      generateChartData();
    }
  }, [transformedEvents]);

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let events: RawEvent[] = [];
      
      if (isBrowser) {
        // In browser, always fetch from API
        console.log("Browser environment: Fetching events from API");
        events = await fetchEvents(filters.startDate, filters.endDate);
      } else {
        // In Node.js, use the database
        console.log("Server environment: Fetching events from database");
        events = await fetchStoredEvents();
      }
      
      // Filter by selected currencies
      const filteredEvents = events.filter(event => 
        filters.currencies.includes(event.currency as CurrencyType)
      );
      
      setRawEvents(filteredEvents);
      
      // Transform events and calculate scores
      const transformed = filteredEvents.map(event => transformEvent(event));
      setTransformedEvents(transformed);
    } catch (err) {
      setError("Failed to load events. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load events. Please try again later.",
        variant: "destructive"
      });
      console.error("Error loading events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = () => {
    // Group events by date and sum weighted scores
    const groupedData = groupEventsByDate(transformedEvents, 'weightedScore');
    
    // Convert to chart data format
    const chartDataPoints: ChartDataPoint[] = Object.entries(groupedData)
      .map(([date, values]) => ({
        date,
        ...values
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setChartData(chartDataPoints);
  };

  const updateFilters = (newFilters: Partial<EventFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const updateEventWeight = (eventId: string, newWeight: number) => {
    setTransformedEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? recalculateWeightedScore(event, newWeight)
          : event
      )
    );
  };

  const refreshData = async () => {
    await loadEvents();
  };

  const value = {
    rawEvents,
    transformedEvents,
    chartData,
    isLoading,
    error,
    filters,
    updateFilters,
    updateEventWeight,
    refreshData,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};
