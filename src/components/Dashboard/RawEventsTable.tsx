
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDisplayDate } from "@/utils/dateUtils";
import { fetchStoredEvents } from "@/services/eventStorage";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const RawEventsTable = () => {
  const { toast } = useToast();
  
  const { data: events, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['raw-events'],
    queryFn: async () => {
      const data = await fetchStoredEvents(100);
      if (data.length === 0) {
        console.log("No events found in database");
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Data refreshed",
        description: `Retrieved ${events?.length || 0} economic events from the database`,
      });
    } catch (err) {
      toast({
        title: "Failed to refresh data",
        description: "An error occurred while fetching events",
        variant: "destructive",
      });
    }
  };

  if (isError) {
    return (
      <div className="bg-card rounded-lg shadow-sm border">
        <div className="p-4 border-b flex justify-between">
          <h2 className="font-semibold">Raw Economic Events</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="p-6 text-center text-destructive">
          Error loading events: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Raw Economic Events</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      <div className="overflow-auto max-h-[500px]">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading raw events...
          </div>
        ) : events && events.length > 0 ? (
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
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{formatDisplayDate(event.date)} {event.time}</TableCell>
                  <TableCell>{event.currency}</TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.impact === 'High' ? 'bg-red-100 text-red-800' : 
                      event.impact === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.impact}
                    </span>
                  </TableCell>
                  <TableCell>{event.previous}</TableCell>
                  <TableCell>{event.forecast}</TableCell>
                  <TableCell>{event.actual}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No economic events found in the database. 
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawEventsTable;
