
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useEvents } from "@/context/EventContext";
import { formatDateString, getDateDaysAgo } from "@/utils/dateUtils";

const WeightAdjuster: React.FC = () => {
  const { filters, updateFilters, refreshData, isLoading } = useEvents();
  
  // Handle date range change
  const handleDateRangeChange = (days: number) => {
    const endDate = formatDateString(new Date());
    const startDate = formatDateString(getDateDaysAgo(days));
    updateFilters({ startDate, endDate });
  };
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Date Range</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refreshData()}
          disabled={isLoading}
          className="h-8"
        >
          <RotateCw className="h-3.5 w-3.5 mr-1" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button 
          variant={filters.startDate === formatDateString(getDateDaysAgo(7)) ? "default" : "outline"}
          size="sm"
          onClick={() => handleDateRangeChange(7)}
          className="h-8"
        >
          7 Days
        </Button>
        <Button 
          variant={filters.startDate === formatDateString(getDateDaysAgo(30)) ? "default" : "outline"}
          size="sm"
          onClick={() => handleDateRangeChange(30)}
          className="h-8"
        >
          30 Days
        </Button>
        <Button 
          variant={filters.startDate === formatDateString(getDateDaysAgo(90)) ? "default" : "outline"}
          size="sm"
          onClick={() => handleDateRangeChange(90)}
          className="h-8"
        >
          90 Days
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="start-date" className="text-xs">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={filters.startDate}
            onChange={e => updateFilters({ startDate: e.target.value })}
            className="h-8"
          />
        </div>
        <div>
          <Label htmlFor="end-date" className="text-xs">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={filters.endDate}
            onChange={e => updateFilters({ endDate: e.target.value })}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
};

export default WeightAdjuster;
