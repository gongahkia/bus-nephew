import { Vehicle, Route, BusStop, TransitData } from '../../types';
import { ltaClient } from '../api/ltaClient';
import { DataTransformer } from './dataTransformer';
import { POLLING_INTERVALS, SINGAPORE_BOUNDS } from '../../constants';
import { logger } from '../../utils';

export class DataManager {
  private vehicles: Vehicle[] = [];
  private routes: Route[] = [];
  private stops: BusStop[] = [];
  private isPolling = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private listeners: ((data: TransitData) => void)[] = [];

  constructor() {
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    logger.info('Initializing transit data...');

    try {
      await Promise.all([
        this.loadBusStops(),
        this.loadBusRoutes(),
      ]);

      logger.info('Initial data loading completed');
    } catch (error) {
      logger.error('Error during initial data loading:', error);
    }
  }

  private async loadBusStops(): Promise<void> {
    try {
      let skip = 0;
      const batchSize = 500;
      const allStops: BusStop[] = [];

      while (true) {
        const response = await ltaClient.getBusStops(skip);

        if (response.status === 'error' || !response.data?.value?.length) {
          break;
        }

        const stops = DataTransformer.transformBusStopsData(response.data);
        allStops.push(...stops);

        if (response.data.value.length < batchSize) {
          break;
        }

        skip += batchSize;
      }

      this.stops = allStops;
      logger.info(`Loaded ${this.stops.length} bus stops`);
    } catch (error) {
      logger.error('Error loading bus stops:', error);
    }
  }

  private async loadBusRoutes(): Promise<void> {
    try {
      let skip = 0;
      const batchSize = 500;
      const allRoutes: Route[] = [];

      while (true) {
        const response = await ltaClient.getBusRoutes(skip);

        if (response.status === 'error' || !response.data?.value?.length) {
          break;
        }

        const routes = DataTransformer.transformBusRoutesData(response.data);
        allRoutes.push(...routes);

        if (response.data.value.length < batchSize) {
          break;
        }

        skip += batchSize;
      }

      this.routes = allRoutes;
      logger.info(`Loaded ${this.routes.length} bus routes`);
    } catch (error) {
      logger.error('Error loading bus routes:', error);
    }
  }

  private async updateVehicleData(): Promise<void> {
    try {
      const updatedVehicles: Vehicle[] = [];

      const sampleStops = this.stops.slice(0, 10);

      for (const stop of sampleStops) {
        const response = await ltaClient.getBusArrival(stop.id);

        if (response.status === 'success' && response.data) {
          const vehicles = DataTransformer.transformBusArrivalToVehicles(response.data);
          updatedVehicles.push(...vehicles);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const filteredVehicles = DataTransformer.filterVehiclesByBounds(
        updatedVehicles,
        SINGAPORE_BOUNDS
      );

      this.vehicles = filteredVehicles;
      this.notifyListeners();

      logger.info(`Updated ${this.vehicles.length} vehicles`);
    } catch (error) {
      logger.error('Error updating vehicle data:', error);
    }
  }

  private notifyListeners(): void {
    const data: TransitData = {
      vehicles: this.vehicles,
      routes: this.routes,
      stops: this.stops,
      lastUpdated: new Date().toISOString(),
    };

    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        logger.error('Error notifying listener:', error);
      }
    });
  }

  public startPolling(): void {
    if (this.isPolling) {
      logger.warn('Polling is already active');
      return;
    }

    this.isPolling = true;
    logger.info(`Starting data polling with ${POLLING_INTERVALS.API_DATA}ms interval`);

    this.updateVehicleData();

    this.pollingInterval = setInterval(() => {
      this.updateVehicleData();
    }, POLLING_INTERVALS.API_DATA);
  }

  public stopPolling(): void {
    if (!this.isPolling) {
      return;
    }

    this.isPolling = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    logger.info('Data polling stopped');
  }

  public subscribe(listener: (data: TransitData) => void): () => void {
    this.listeners.push(listener);

    const currentData: TransitData = {
      vehicles: this.vehicles,
      routes: this.routes,
      stops: this.stops,
      lastUpdated: new Date().toISOString(),
    };

    listener(currentData);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getCurrentData(): TransitData {
    return {
      vehicles: this.vehicles,
      routes: this.routes,
      stops: this.stops,
      lastUpdated: new Date().toISOString(),
    };
  }

  public getVehiclesByRoute(routeId: string): Vehicle[] {
    return this.vehicles.filter(vehicle => vehicle.route_id === routeId);
  }

  public getStopsByRoute(routeId: string): BusStop[] {
    const route = this.routes.find(r => r.id === routeId);
    if (!route) return [];

    return this.stops.filter(stop => route.stops.includes(stop.id));
  }

  public async refreshData(): Promise<void> {
    logger.info('Manual data refresh triggered');
    ltaClient.clearCache();
    await this.initializeData();
    await this.updateVehicleData();
  }

  public destroy(): void {
    this.stopPolling();
    this.listeners = [];
    this.vehicles = [];
    this.routes = [];
    this.stops = [];
  }
}

export const dataManager = new DataManager();