
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { useEffect, useState } from "react";
import { toast } from "./components/ui/use-toast";
import { fetchEvents } from "./services/api";
import { format, subDays } from "date-fns";
import { fetchStoredEvents } from "./services/eventStorage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('user');
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    setIsBrowser(typeof window !== 'undefined' && typeof process === 'undefined');
  }, []);

  useEffect(() => {
    // Initialize the app and load initial data
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        // In browser environments, we'll use the API directly
        if (isBrowser) {
          console.log("Browser environment: Will fetch events from API");
          const endDate = format(new Date(), 'yyyy-MM-dd');
          const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
          
          toast({
            title: "Loading Data",
            description: "Fetching economic events for the past week...",
          });
          
          await fetchEvents(startDate, endDate);
          
          toast({
            title: "Data Loaded",
            description: "Economic events have been loaded.",
          });
        } else {
          // Check if we have any events in the database by fetching events
          const events = await fetchStoredEvents();
          const count = events.length;
            
          console.log("Data count check:", count);
          
          // Check if the count is 0 (empty table)
          if (count === 0) {
            console.log("No events found in database, fetching initial data");
            const endDate = format(new Date(), 'yyyy-MM-dd');
            const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
            
            toast({
              title: "Initializing Database",
              description: "Fetching economic events for the past week...",
            });
            
            await fetchEvents(startDate, endDate);
            
            toast({
              title: "Database Initialized",
              description: "Economic events have been loaded.",
            });
          } else {
            console.log(`Database already contains ${count} events`);
          }
        }
      } catch (err) {
        console.warn("Error during app initialization:", err);
        toast({
          title: "Data Loading Error",
          description: "There was an issue loading the economic events data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [isBrowser]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <AuthRoute>
                <Index />
              </AuthRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
