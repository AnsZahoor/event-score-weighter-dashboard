
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminUserManagement from "./pages/AdminUserManagement";
import { supabase } from "./integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "./components/ui/use-toast";
import { fetchEvents } from "./services/api";
import { format, subDays } from "date-fns";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        // Check user status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .single();

        setIsAuthenticated(profileData?.status === 'approved');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured and load initial data
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        // Check Supabase connection
        const { error } = await supabase.from('economic_events').select('count').limit(1);
        if (error) {
          console.error("Supabase configuration error:", error);
          setIsSupabaseConfigured(false);
          toast({
            title: "Supabase Configuration Error",
            description: "There was an issue connecting to the Supabase database.",
            variant: "destructive",
          });
          return;
        }

        // Load some initial data if we don't have any
        const { data, count, error: countError } = await supabase
          .from('economic_events')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error("Error checking event count:", countError);
          return;
        }
          
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
        
        setIsSupabaseConfigured(true);
      } catch (err) {
        console.warn("Error during app initialization:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <AdminUserManagement />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
