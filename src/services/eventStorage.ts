
import { supabase } from "@/integrations/supabase/client";
import { RawEvent } from "@/types/event";

export const storeEvents = async (events: RawEvent[]) => {
  const eventsToInsert = events.map(event => ({
    country: event.country,
    currency: event.currency,
    title: event.title,
    date: event.date,
    time: event.time,
    impact: event.impact,
    previous: event.previous,
    forecast: event.forecast,
    actual: event.actual
  }));

  const { error } = await supabase
    .from('economic_events')
    .upsert(eventsToInsert, { 
      onConflict: 'country,currency,title,date,time',
      ignoreDuplicates: true 
    });

  if (error) {
    console.error('Error storing events:', error);
    throw error;
  }
};
