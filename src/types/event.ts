
export interface RawEvent {
  id: string;
  country: string;
  currency: CurrencyType;
  title: string;
  date: string;
  time: string;
  impact: 'Low' | 'Medium' | 'High';
  previous: string;
  forecast: string;
  actual: string;
}

export interface TransformedEvent {
  id: string;
  eventType: string;
  currency: CurrencyType;
  timestamp: string;
  previous: number;
  forecast: number;
  actual: number;
  weight: number;
  score: number;
  weightedScore: number;
}

export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF';

export interface ChartDataPoint {
  date: string;
  USD?: number;
  EUR?: number;
  GBP?: number;
  JPY?: number;
  CHF?: number;
  [key: string]: string | number | undefined;
}

export interface EventFilters {
  startDate: string;
  endDate: string;
  currencies: CurrencyType[];
}
