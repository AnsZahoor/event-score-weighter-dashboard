
import { RawEvent, TransformedEvent } from "../types/event";
import { combineDateTime } from "../utils/dateUtils";

/**
 * Calculate score based on the comparison rules:
 * +2: Data is "better than previous and forecast."
 * +1: Data is "better than previous but not forecast."
 * -1: Data is "worse than previous but better than forecast."
 * -2: Data is "worse than previous and forecast."
 */
export const calculateEventScore = (
  actual: number,
  previous: number,
  forecast: number
): number => {
  const betterThanPrevious = isBetterThanPrevious(actual, previous);
  const betterThanForecast = isBetterThanForecast(actual, forecast);
  
  if (betterThanPrevious && betterThanForecast) {
    return 2;
  } else if (betterThanPrevious && !betterThanForecast) {
    return 1;
  } else if (!betterThanPrevious && betterThanForecast) {
    return -1;
  } else {
    return -2;
  }
};

/**
 * Transform raw event data to calculated event data with scores
 */
export const transformEvent = (rawEvent: RawEvent, weight = 1): TransformedEvent => {
  // Extract numeric values from string values
  const previous = parseFloatValue(rawEvent.previous);
  const forecast = parseFloatValue(rawEvent.forecast);
  const actual = parseFloatValue(rawEvent.actual);
  
  // Calculate score based on rules
  const score = calculateEventScore(actual, previous, forecast);
  
  // Calculate weighted score
  const weightedScore = score * weight;
  
  return {
    id: rawEvent.id,
    eventType: rawEvent.title,
    currency: rawEvent.currency,
    timestamp: combineDateTime(rawEvent.date, rawEvent.time),
    previous,
    forecast,
    actual,
    weight,
    score,
    weightedScore,
  };
};

/**
 * Recalculate weighted score when weight is updated
 */
export const recalculateWeightedScore = (
  event: TransformedEvent,
  newWeight: number
): TransformedEvent => {
  return {
    ...event,
    weight: newWeight,
    weightedScore: event.score * newWeight,
  };
};

/**
 * Helper function to parse float from string values, handling % and other formats
 */
const parseFloatValue = (value: string): number => {
  if (!value || value === "") return 0;
  
  // Remove % signs and other non-numeric characters except decimal point and minus sign
  const cleanedValue = value.replace(/[^\d.-]/g, '');
  const result = parseFloat(cleanedValue);
  
  return isNaN(result) ? 0 : result;
};

/**
 * Determine if actual value is better than previous
 * This is a simplified logic and might need to be adjusted based on economic indicator type
 * For unemployment and inflation, lower is better
 * For GDP, retail sales, etc., higher is better
 */
const isBetterThanPrevious = (actual: number, previous: number): boolean => {
  // For simplicity, assuming higher is better for all indicators
  // In a real implementation, this would depend on the event type
  return actual > previous;
};

/**
 * Determine if actual value is better than forecast
 */
const isBetterThanForecast = (actual: number, forecast: number): boolean => {
  // For simplicity, assuming higher is better for all indicators
  // In a real implementation, this would depend on the event type
  return actual > forecast;
};
