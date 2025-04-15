
import { supabase } from "@/integrations/supabase/client";
import { RawEvent } from "@/types/event";

export const storeEvents = async (events: RawEvent[]) => {
  // Skip if no events to store
  if (!events || events.length === 0) {
    console.log("No events to store");
    return;
  }

  console.log(`Attempting to store ${events.length} events to Supabase`);
  
  const eventsToInsert = events.map(event => ({
    country: event.country,
    currency: event.currency,
    title: event.title,
    date: event.date,
    time: event.time,
    impact: event.impact,
    previous: event.previous,
    forecast: event.forecast,
    actual: event.actual,
    id: event.id || crypto.randomUUID() // Ensure each event has a unique ID
  }));

  try {
    console.log('Events to insert:', JSON.stringify(eventsToInsert, null, 2));
    
    const { data, error } = await supabase
      .from('economic_events')
      .upsert(eventsToInsert, { 
        onConflict: 'country,currency,title,date,time',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Detailed Error storing events:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    // Correctly handle the possibly null data with proper type checking
    const successCount = data ? (Array.isArray(data) ? data.length : 0) : 0;
    console.log(`Successfully stored/updated ${successCount} events in Supabase`);
    return data;
  } catch (error) {
    console.error('Failed to store events:', error);
    throw error;
  }
};

export const fetchStoredEvents = async (limit = 100) => {
  try {
    console.log('Fetching stored events from Supabase');
    const { data, error } = await supabase
      .from('economic_events')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching stored events:', error);
      console.error('Detailed error:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} events from Supabase`);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch stored events:', error);
    return [];
  }
};
