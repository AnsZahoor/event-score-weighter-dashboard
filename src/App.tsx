
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { supabase } from "./integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "./components/ui/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabaseConfig = async () => {
      try {
        const { error } = await supabase.from('economic_events').select('*').limit(1);
        if (error) {
          setIsSupabaseConfigured(false);
          toast({
            title: "Supabase Configuration Error",
            description: "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
            variant: "destructive",
          });
          console.error("Supabase configuration error:", error);
        }
      } catch (err) {
        // Connectivity check failed, but don't block the app
        console.warn("Supabase connectivity check failed:", err);
      }
    };

    checkSupabaseConfig();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
