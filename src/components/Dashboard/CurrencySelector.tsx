
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CurrencyType } from '@/types/event';
import { useEvents } from '@/context/EventContext';

const currencies: { value: CurrencyType; label: string }[] = [
  { value: 'USD', label: 'US Dollar' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British Pound' },
  { value: 'JPY', label: 'Japanese Yen' },
  { value: 'CHF', label: 'Swiss Franc' },
];

const CurrencySelector: React.FC = () => {
  const { filters, updateFilters } = useEvents();
  
  const handleCurrencyToggle = (currency: CurrencyType) => {
    const isSelected = filters.currencies.includes(currency);
    let updatedCurrencies: CurrencyType[];
    
    if (isSelected) {
      // Remove currency if already selected
      updatedCurrencies = filters.currencies.filter(c => c !== currency);
    } else {
      // Add currency if not selected
      updatedCurrencies = [...filters.currencies, currency];
    }
    
    // Don't allow empty selection
    if (updatedCurrencies.length === 0) return;
    
    updateFilters({ currencies: updatedCurrencies });
  };
  
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border">
      <h3 className="font-medium text-sm mb-3">Currencies</h3>
      <div className="space-y-2">
        {currencies.map(currency => (
          <div key={currency.value} className="flex items-center space-x-2">
            <Checkbox 
              id={`currency-${currency.value}`} 
              checked={filters.currencies.includes(currency.value)}
              onCheckedChange={() => handleCurrencyToggle(currency.value)}
              className={`border-currency-${currency.value.toLowerCase()}`}
            />
            <Label 
              htmlFor={`currency-${currency.value}`}
              className="text-sm font-normal cursor-pointer flex items-center"
            >
              <div 
                className={`w-3 h-3 rounded-full mr-2 bg-currency-${currency.value.toLowerCase()}`}
              />
              {currency.label} ({currency.value})
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencySelector;
