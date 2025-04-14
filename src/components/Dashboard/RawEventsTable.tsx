
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDisplayDate } from "@/utils/dateUtils";

const RawEventsTable = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['raw-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('economic_events')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>Loading raw events...</div>;
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Raw Economic Events</h2>
      </div>
      <div className="overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Previous</TableHead>
              <TableHead>Forecast</TableHead>
              <TableHead>Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events?.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{formatDisplayDate(event.date)} {event.time}</TableCell>
                <TableCell>{event.currency}</TableCell>
                <TableCell>{event.title}</TableCell>
                <TableCell>{event.impact}</TableCell>
                <TableCell>{event.previous}</TableCell>
                <TableCell>{event.forecast}</TableCell>
                <TableCell>{event.actual}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RawEventsTable;
