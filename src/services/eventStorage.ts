
import { RawEvent } from "@/types/event";
import prisma from "@/lib/prisma";

export const storeEvents = async (events: RawEvent[]) => {
  // Skip if no events to store
  if (!events || events.length === 0) {
    console.log("No events to store");
    return;
  }

  console.log(`Attempting to store ${events.length} events to local database`);
  
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

    console.log('Events to insert:', JSON.stringify(eventsToInsert, null, 2));
    
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
    
    console.log(`Successfully stored/updated ${results.length} events in local database`);
    return results;
  } catch (error) {
    console.error('Failed to store events:', error);
    throw error;
  }
};

export const fetchStoredEvents = async (limit = 100) => {
  try {
    console.log('Fetching stored events from local database');
    
    const data = await prisma.economicEvent.findMany({
      orderBy: {
        date: 'desc'
      },
      take: limit
    });

    console.log(`Retrieved ${data.length} events from local database`);
    return data;
  } catch (error) {
    console.error('Failed to fetch stored events:', error);
    return [];
  }
};
