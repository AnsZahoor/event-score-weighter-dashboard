
/**
 * Format a date string to YYYY-MM-DD format
 */
export const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get date for X days ago from now
 */
export const getDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Format to display date in more readable format
 */
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

/**
 * Combine date and time strings to create a timestamp
 */
export const combineDateTime = (date: string, time: string): string => {
  return `${date}T${time}:00`;
};

/**
 * Group events by date for charting
 */
export const groupEventsByDate = <T extends { timestamp: string; currency: string }>(
  events: T[],
  valueKey: keyof T
): Record<string, Record<string, number>> => {
  const result: Record<string, Record<string, number>> = {};
  
  events.forEach(event => {
    const date = event.timestamp.split('T')[0];
    if (!result[date]) {
      result[date] = {};
    }
    
    if (!result[date][event.currency]) {
      result[date][event.currency] = 0;
    }
    
    // Add the weighted score to the accumulated value for this currency on this date
    result[date][event.currency] += Number(event[valueKey]) || 0;
  });
  
  return result;
};
