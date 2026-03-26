import React, { createContext, useContext, useState } from 'react';

type CurrencyCode = 'KES' | 'UGX' | 'TZS' | 'RWF';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  convert: (amount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const RATES: Record<CurrencyCode, number> = {
  KES: 1,
  UGX: 28.5,
  TZS: 19.2,
  RWF: 9.8
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('KES');

  const convert = (amount: number) => {
    return amount * RATES[currency];
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates: RATES, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};
