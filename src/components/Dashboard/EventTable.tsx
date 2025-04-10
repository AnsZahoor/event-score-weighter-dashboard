
import React, { useState } from 'react';
import { useEvents } from '@/context/EventContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from "@/components/ui/input";
import { formatDisplayDate } from '@/utils/dateUtils';
import { TransformedEvent } from '@/types/event';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const EventTable: React.FC = () => {
  const { transformedEvents, updateEventWeight } = useEvents();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TransformedEvent | null;
    direction: 'ascending' | 'descending';
  }>({
    key: 'timestamp',
    direction: 'descending',
  });

  // Filter events by search term
  const filteredEvents = transformedEvents.filter(event => 
    event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort events based on sort configuration
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Handle column header click for sorting
  const requestSort = (key: keyof TransformedEvent) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle weight change
  const handleWeightChange = (eventId: string, newWeight: number) => {
    updateEventWeight(eventId, newWeight);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="font-semibold mb-2">Event Details</h2>
        <Input 
          placeholder="Search events..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      <div className="overflow-auto max-h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted z-10">
            <TableRow>
              <TableHead className="w-[180px] cursor-pointer" onClick={() => requestSort('timestamp')}>
                Date/Time {sortConfig.key === 'timestamp' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('currency')}>
                Currency {sortConfig.key === 'currency' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('eventType')}>
                Event Type {sortConfig.key === 'eventType' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('actual')}>
                Actual {sortConfig.key === 'actual' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('forecast')}>
                Forecast {sortConfig.key === 'forecast' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('previous')}>
                Previous {sortConfig.key === 'previous' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('score')}>
                Score {sortConfig.key === 'score' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-center">Weight</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => requestSort('weightedScore')}>
                Weighted Score {sortConfig.key === 'weightedScore' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length > 0 ? (
              sortedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {formatDisplayDate(event.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 bg-currency-${event.currency.toLowerCase()}`}
                      />
                      {event.currency}
                    </div>
                  </TableCell>
                  <TableCell>{event.eventType}</TableCell>
                  <TableCell className="text-right">{event.actual}</TableCell>
                  <TableCell className="text-right">{event.forecast}</TableCell>
                  <TableCell className="text-right">{event.previous}</TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    event.score > 0 ? "positive" : event.score < 0 ? "negative" : ""
                  )}>
                    {event.score}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Slider
                        defaultValue={[event.weight]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(values) => handleWeightChange(event.id, values[0])}
                        className="w-24"
                      />
                      <span className="text-xs font-medium w-6 text-center">
                        {event.weight}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    event.weightedScore > 0 ? "positive" : event.weightedScore < 0 ? "negative" : ""
                  )}>
                    {event.weightedScore}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No events found. Try adjusting your search or filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EventTable;
