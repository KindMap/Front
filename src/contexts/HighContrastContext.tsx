import React, { createContext, useContext, useState, useEffect } from 'react';

interface HighContrastContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined);

export function HighContrastProvider({ children }: { children: React.ReactNode }) {
  const [isHighContrast, setIsHighContrast] = useState(false);

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  useEffect(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return (
    <HighContrastContext.Provider value={{ isHighContrast, toggleHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
}

export function useHighContrast() {
  const context = useContext(HighContrastContext);
  if (context === undefined) {
    throw new Error('useHighContrast must be used within a HighContrastProvider');
  }
  return context;
}
