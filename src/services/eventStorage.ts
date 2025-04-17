
import { RawEvent } from "@/types/event";
import prisma from "@/lib/prisma";

// Browser detection
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// In-memory storage for browser environment
const browserEventStore: RawEvent[] = [];

export const storeEvents = async (events: RawEvent[]) => {
  // Skip if no events to store
  if (!events || events.length === 0) {
    console.log("No events to store");
    return;
  }

  console.log(`Attempting to store ${events.length} events`);
  
  try {
    const eventsToInsert = events.map(event => ({
      id: event.id || crypto.randomUUID(),
      country: event.country,
      currency: event.currency,
      title: event.title,
      date: event.date,
      time: event.time,
      impact: event.impact,
      previous: event.previous,
      forecast: event.forecast,
      actual: event.actual,
    }));

    if (isBrowser) {
      // Store in browser memory
      console.log('Browser environment: Storing events in memory');
      
      // Merge with existing data (avoiding duplicates by ID)
      const existingIds = new Set(browserEventStore.map(e => e.id));
      
      eventsToInsert.forEach(event => {
        if (!existingIds.has(event.id)) {
          browserEventStore.push(event as RawEvent);
        } else {
          // Update existing event
          const index = browserEventStore.findIndex(e => e.id === event.id);
          if (index >= 0) {
            browserEventStore[index] = event as RawEvent;
          }
        }
      });
      
      return browserEventStore;
    }
    
    // Server environment: Use Prisma
    console.log('Server environment: Storing events in database');
    
    // Use upsert for each event to handle duplicates
    const results = await Promise.all(
      eventsToInsert.map(event => 
        prisma.economicEvent.upsert({
          where: { id: event.id },
          update: event,
          create: event
        })
      )
    );
    
    console.log(`Successfully stored/updated ${results.length} events in database`);
    return results;
  } catch (error) {
    console.error('Failed to store events:', error);
    throw error;
  }
};

export const fetchStoredEvents = async (limit = 100) => {
  try {
    if (isBrowser) {
      console.log('Browser environment: Fetching events from memory');
      // Return the last 'limit' events from the in-memory store
      return browserEventStore.slice(-limit);
    }
    
    // Server environment: Use Prisma
    console.log('Server environment: Fetching events from database');
    
    const data = await prisma.economicEvent.findMany({
      orderBy: {
        date: 'desc'
      },
      take: limit
    });

    console.log(`Retrieved ${data.length} events from database`);
    return data;
  } catch (error) {
    console.error('Failed to fetch stored events:', error);
    return [];
  }
};
