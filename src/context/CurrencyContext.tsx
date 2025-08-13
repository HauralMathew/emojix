import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CurrencyContextType {
  isAptCurrency: boolean;
  setIsAptCurrency: (value: boolean) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [isAptCurrency, setIsAptCurrency] = useState(true);

  return (
    <CurrencyContext.Provider value={{ isAptCurrency, setIsAptCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
