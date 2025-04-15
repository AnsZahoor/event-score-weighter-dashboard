import React, { useEffect, useState } from 'react';
import { EventProvider } from '@/context/EventContext';
import CurrencySelector from '@/components/Dashboard/CurrencySelector';
import EventScoreChart from '@/components/Dashboard/EventScoreChart';
import WeightAdjuster from '@/components/Dashboard/WeightAdjuster';
import EventTable from '@/components/Dashboard/EventTable';
import RawEventsTable from '@/components/Dashboard/RawEventsTable';
import { MoveUpRight, LogOut } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate('/auth');
  };

  if (!user) return null; // Don't render until we check auth state
  
  return (
    <EventProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Event Score Weighter Dashboard</h1>
            <div className="text-sm text-muted-foreground ml-4">myfxbook Calendar Data</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">{user.email}</div>
            {user.role === 'admin' && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Admin Dashboard
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:col-span-1">
              <WeightAdjuster />
            </div>
            <div className="md:col-span-1">
              <CurrencySelector />
            </div>
            <div className="md:col-span-2">
              <div className="bg-card p-4 rounded-lg shadow-sm border h-full">
                <h2 className="font-semibold mb-3">Dashboard Guide</h2>
                <div className="text-sm space-y-2">
                  <p>This dashboard allows you to analyze economic event scores based on performance relative to previous and forecast values.</p>
                  <div className="p-2 bg-muted rounded">
                    <p className="font-medium">Scoring Logic:</p>
                    <ul className="ml-5 list-disc space-y-1 mt-1">
                      <li className="positive">+2: Better than previous and forecast</li>
                      <li className="positive">+1: Better than previous but not forecast</li>
                      <li className="negative">-1: Worse than previous but better than forecast</li>
                      <li className="negative">-2: Worse than previous and forecast</li>
                    </ul>
                  </div>
                  <p>Adjust weights using the sliders in the table to emphasize important events. The weighted score is automatically recalculated.</p>
                </div>
                <div className="mt-6 text-sm">
                  <p className="font-medium">Data Source:</p>
                  <p className="flex items-center text-primary">
                    myfxbook Calendar API
                    <MoveUpRight className="h-3 w-3 ml-1" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          <EventScoreChart />

          <div className="mt-6">
            <EventTable />
          </div>

          <div className="mt-6">
            <RawEventsTable />
          </div>
        </main>
      </div>
    </EventProvider>
  );
};

export default Index;
