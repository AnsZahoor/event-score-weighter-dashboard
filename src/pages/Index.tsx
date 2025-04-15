import React, { useState, useEffect } from 'react';
import { EventProvider } from '@/context/EventContext';
import CurrencySelector from '@/components/Dashboard/CurrencySelector';
import EventScoreChart from '@/components/Dashboard/EventScoreChart';
import WeightAdjuster from '@/components/Dashboard/WeightAdjuster';
import EventTable from '@/components/Dashboard/EventTable';
import RawEventsTable from '@/components/Dashboard/RawEventsTable';
import { MoveUpRight, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!adminData);
    };

    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <EventProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Event Score Weighter Dashboard</h1>
            <div className="text-sm text-muted-foreground ml-4">myfxbook Calendar Data</div>
          </div>
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/admin/users')}
              >
                <Users className="mr-2 h-4 w-4" /> User Management
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="container py-6">
          {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && (
            <Alert className="mb-6 border-amber-500">
              <AlertTitle>Supabase Configuration Required</AlertTitle>
              <AlertDescription>
                Please set the following environment variables in your project:
                <ul className="list-disc ml-5 mt-2">
                  <li>VITE_SUPABASE_URL - Your Supabase project URL</li>
                  <li>VITE_SUPABASE_ANON_KEY - Your Supabase anonymous key</li>
                </ul>
                <p className="mt-2">These values can be found in your Supabase project settings.</p>
              </AlertDescription>
            </Alert>
          )}

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
