import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { type Product, type Transaction, type Customer, type Chama } from '../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

interface AppStateContextType {
  products: Product[];
  transactions: Transaction[];
  customers: Customer[];
  chamas: Chama[];
  isLoading: boolean;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  refreshData: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  
  // Use Dexie live queries for real-time updates
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.orderBy('timestamp').reverse().toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const chamas = useLiveQuery(() => db.chamas.toArray()) || [];

  useEffect(() => {
    const init = async () => {
      if (isDemoMode) {
        await dataService.seedDemoData();
      }
    };
    init();
  }, [isDemoMode]);

  const toggleDemoMode = () => setIsDemoMode(!isDemoMode);
  const refreshData = () => dataService.triggerSync();

  return (
    <AppStateContext.Provider value={{
      products,
      transactions,
      customers,
      chamas,
      isLoading: false,
      isDemoMode,
      toggleDemoMode,
      refreshData
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};
