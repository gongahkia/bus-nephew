import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TransitData, ViewConfig } from '../types';
import { dataManager } from '../services/data/dataManager';
import { DEFAULT_MAP_CONFIG } from '../constants';
import { logger } from '../utils';

interface TransitContextType {
  transitData: TransitData | null;
  viewConfig: ViewConfig;
  isLoading: boolean;
  error: string | null;
  updateViewConfig: (config: Partial<ViewConfig>) => void;
  refreshData: () => Promise<void>;
}

const TransitContext = createContext<TransitContextType | undefined>(undefined);

interface TransitProviderProps {
  children: ReactNode;
}

export const TransitProvider: React.FC<TransitProviderProps> = ({ children }) => {
  const [transitData, setTransitData] = useState<TransitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewConfig, setViewConfig] = useState<ViewConfig>({
    mode: '2d',
    center: DEFAULT_MAP_CONFIG.CENTER,
    zoom: DEFAULT_MAP_CONFIG.ZOOM,
    selectedRoutes: [],
  });

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        unsubscribe = dataManager.subscribe((data) => {
          setTransitData(data);
          setIsLoading(false);
          logger.info('Transit data updated in context');
        });

        dataManager.startPolling();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize transit data');
        setIsLoading(false);
        logger.error('Error initializing transit data:', err);
      }
    };

    initializeData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      dataManager.stopPolling();
    };
  }, []);

  const updateViewConfig = (config: Partial<ViewConfig>) => {
    setViewConfig(prev => ({ ...prev, ...config }));
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await dataManager.refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
      logger.error('Error refreshing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: TransitContextType = {
    transitData,
    viewConfig,
    isLoading,
    error,
    updateViewConfig,
    refreshData,
  };

  return (
    <TransitContext.Provider value={contextValue}>
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = (): TransitContextType => {
  const context = useContext(TransitContext);
  if (context === undefined) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
};