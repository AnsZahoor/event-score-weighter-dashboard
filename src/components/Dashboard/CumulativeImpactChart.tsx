
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TransformedEvent, CurrencyType } from '@/types/event';

interface Props {
  events: TransformedEvent[];
  selectedCurrencies: CurrencyType[];
}

const CumulativeImpactChart: React.FC<Props> = ({ events, selectedCurrencies }) => {
  // Process events to calculate cumulative scores
  const processedData = React.useMemo(() => {
    const dataByDate = new Map<string, Record<string, number>>();
    
    // Initialize cumulative scores for each currency
    const cumulativeScores: Record<CurrencyType, number> = {} as Record<CurrencyType, number>;
    selectedCurrencies.forEach(currency => {
      cumulativeScores[currency] = 0;
    });

    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate cumulative scores
    sortedEvents.forEach(event => {
      if (selectedCurrencies.includes(event.currency)) {
        const date = event.timestamp.split('T')[0];
        cumulativeScores[event.currency] += event.weightedScore;

        if (!dataByDate.has(date)) {
          dataByDate.set(date, {});
        }
        
        const dateData = dataByDate.get(date)!;
        dateData[event.currency] = cumulativeScores[event.currency];
        dataByDate.set(date, dateData);
      }
    });

    // Convert to array format for Recharts
    return Array.from(dataByDate.entries()).map(([date, scores]) => ({
      date,
      ...scores
    }));
  }, [events, selectedCurrencies]);

  if (selectedCurrencies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Please select at least one currency to display the chart.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[-10, 10]} />
          <Tooltip />
          <Legend />
          {selectedCurrencies.map((currency) => (
            <Line
              key={currency}
              type="monotone"
              dataKey={currency}
              name={currency}
              stroke={getCurrencyColor(currency)}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Helper function to get consistent colors for currencies
const getCurrencyColor = (currency: CurrencyType): string => {
  const colors: Record<CurrencyType, string> = {
    USD: '#2E7D32',
    EUR: '#1976D2',
    GBP: '#C62828',
    JPY: '#6A1B9A',
    CHF: '#F57C00'
  };
  return colors[currency];
};

export default CumulativeImpactChart;
