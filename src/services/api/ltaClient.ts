import { API_ENDPOINTS } from '../../constants';
import { ApiResponse } from '../../types';
import { logger } from '../../utils';

class LTAClient {
  private baseUrl: string;
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 30000;

  constructor() {
    this.baseUrl = import.meta.env.VITE_LTA_BASE_URL || 'http://datamall2.mytransport.sg/ltaodataservice';
    this.apiKey = import.meta.env.VITE_LTA_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('LTA API key not found. Please set VITE_LTA_API_KEY in your environment variables.');
    }
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      logger.info(`Cache hit for ${endpoint}`);
      return {
        data: cached.data,
        timestamp: new Date(cached.timestamp).toISOString(),
        status: 'success',
      };
    }

    try {
      const url = new URL(endpoint, this.baseUrl);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'AccountKey': this.apiKey,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      logger.info(`API call successful for ${endpoint}`);

      return {
        data,
        timestamp: new Date().toISOString(),
        status: 'success',
      };
    } catch (error) {
      logger.error(`API call failed for ${endpoint}:`, error);

      if (cached) {
        logger.info(`Returning stale cache for ${endpoint}`);
        return {
          data: cached.data,
          timestamp: new Date(cached.timestamp).toISOString(),
          status: 'success',
          message: 'Returned cached data due to API error',
        };
      }

      return {
        data: null as T,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getBusArrival(busStopCode: string, serviceNo?: string): Promise<ApiResponse<any>> {
    const params: Record<string, string> = { BusStopCode: busStopCode };
    if (serviceNo) {
      params.ServiceNo = serviceNo;
    }
    return this.makeRequest(API_ENDPOINTS.BUS_ARRIVAL, params);
  }

  async getBusRoutes(skip = 0): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.BUS_ROUTES, { $skip: skip.toString() });
  }

  async getBusStops(skip = 0): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.BUS_STOPS, { $skip: skip.toString() });
  }

  async getBusServices(skip = 0): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.BUS_SERVICES, { $skip: skip.toString() });
  }

  async getTrainServiceAlerts(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.TRAIN_SERVICE_ALERTS);
  }

  clearCache(): void {
    this.cache.clear();
    logger.info('API cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const ltaClient = new LTAClient();