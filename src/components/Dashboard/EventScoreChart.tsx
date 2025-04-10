
import React from 'react';
import { useEvents } from '@/context/EventContext';
import { formatDisplayDate } from '@/utils/dateUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { 
  ValueType, 
  NameType 
} from 'recharts/types/component/DefaultTooltipContent';

const EventScoreChart: React.FC = () => {
  const { chartData, isLoading, filters } = useEvents();

  const currencies = filters.currencies;
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="font-medium">{formatDisplayDate(label as string)}</p>
          <div className="mt-1">
            {payload.map((entry, index) => (
              <p key={index} className="flex items-center justify-between gap-2">
                <span className="flex items-center">
                  <span 
                    className="w-2 h-2 rounded-full inline-block mr-1"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}: 
                </span>
                <span className={Number(entry.value) >= 0 ? "positive font-medium" : "negative font-medium"}>
                  {entry.value}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-card rounded-lg border">
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-card rounded-lg border">
        <p>No data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border h-[400px]">
      <h2 className="font-semibold mb-4">Weighted Event Scores by Currency</h2>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDisplayDate}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis domain={[-10, 10]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {currencies.includes('USD') && (
            <Line 
              type="monotone" 
              dataKey="USD" 
              stroke="#22c55e" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          )}
          {currencies.includes('EUR') && (
            <Line 
              type="monotone" 
              dataKey="EUR" 
              stroke="#3b82f6" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          )}
          {currencies.includes('GBP') && (
            <Line 
              type="monotone" 
              dataKey="GBP" 
              stroke="#ef4444" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          )}
          {currencies.includes('JPY') && (
            <Line 
              type="monotone" 
              dataKey="JPY" 
              stroke="#f59e0b" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          )}
          {currencies.includes('CHF') && (
            <Line 
              type="monotone" 
              dataKey="CHF" 
              stroke="#8b5cf6" 
              dot={false} 
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventScoreChart;
