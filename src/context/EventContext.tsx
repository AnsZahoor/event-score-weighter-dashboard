
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RawEvent, TransformedEvent, EventFilters, CurrencyType, ChartDataPoint } from '../types/event';
import { fetchEvents } from '../services/api';
import { transformEvent, recalculateWeightedScore } from '../services/scoreCalculator';
import { formatDateString, getDateDaysAgo, groupEventsByDate } from '../utils/dateUtils';
import { toast } from "../components/ui/use-toast";
import { getCurrentUser, signOut } from '@/lib/supabase';

interface EventContextProps {
  rawEvents: RawEvent[];
  transformedEvents: TransformedEvent[];
  chartData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  filters: EventFilters;
  user: any; // User from Supabase auth
  updateFilters: (newFilters: Partial<EventFilters>) => void;
  updateEventWeight: (eventId: string, newWeight: number) => void;
  refreshData: () => Promise<void>;
  handleLogout: () => Promise<void>;
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
  const [user, setUser] = useState<any>(null);
  
  // Default filters: last 30 days, all currencies
  const [filters, setFilters] = useState<EventFilters>({
    startDate: formatDateString(getDateDaysAgo(30)),
    endDate: formatDateString(new Date()),
    currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CHF'],
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    checkAuth();
  }, []);

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
      const events = await fetchEvents(filters.startDate, filters.endDate);
      
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
  
  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };

  const value = {
    rawEvents,
    transformedEvents,
    chartData,
    isLoading,
    error,
    filters,
    user,
    updateFilters,
    updateEventWeight,
    refreshData,
    handleLogout,
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
