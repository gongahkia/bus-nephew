import { Vehicle, Route, BusStop } from '../../types';
import { isValidCoordinate, generateId, logger } from '../../utils';
import { COLORS } from '../../constants';

export class DataTransformer {
  static transformBusArrivalToVehicles(apiData: any): Vehicle[] {
    if (!apiData?.Services) {
      return [];
    }

    const vehicles: Vehicle[] = [];

    try {
      apiData.Services.forEach((service: any) => {
        [service.NextBus, service.NextBus2, service.NextBus3]
          .filter(bus => bus && bus.EstimatedArrival)
          .forEach(bus => {
            if (bus.Latitude && bus.Longitude && isValidCoordinate(bus.Latitude, bus.Longitude)) {
              vehicles.push({
                id: generateId(),
                type: 'bus',
                position: {
                  lat: parseFloat(bus.Latitude),
                  lng: parseFloat(bus.Longitude),
                },
                heading: bus.Bearing || 0,
                route_id: service.ServiceNo,
                speed: 0,
                timestamp: bus.EstimatedArrival,
              });
            }
          });
      });

      logger.info(`Transformed ${vehicles.length} vehicles from bus arrival data`);
    } catch (error) {
      logger.error('Error transforming bus arrival data:', error);
    }

    return vehicles;
  }

  static transformBusStopsData(apiData: any): BusStop[] {
    if (!apiData?.value) {
      return [];
    }

    const stops: BusStop[] = [];

    try {
      apiData.value.forEach((stop: any) => {
        if (stop.Latitude && stop.Longitude && isValidCoordinate(stop.Latitude, stop.Longitude)) {
          stops.push({
            id: stop.BusStopCode,
            name: stop.Description,
            position: {
              lat: parseFloat(stop.Latitude),
              lng: parseFloat(stop.Longitude),
            },
            routes: [],
          });
        }
      });

      logger.info(`Transformed ${stops.length} bus stops`);
    } catch (error) {
      logger.error('Error transforming bus stops data:', error);
    }

    return stops;
  }

  static transformBusRoutesData(apiData: any): Route[] {
    if (!apiData?.value) {
      return [];
    }

    const routesMap = new Map<string, Route>();

    try {
      apiData.value.forEach((routeData: any) => {
        const routeId = routeData.ServiceNo;

        if (!routesMap.has(routeId)) {
          routesMap.set(routeId, {
            id: routeId,
            name: routeData.ServiceNo,
            type: 'bus',
            path: [],
            stops: [],
            color: this.generateRouteColor(routeId),
          });
        }

        const route = routesMap.get(routeId)!;

        if (routeData.StopSequence) {
          route.stops.push(routeData.BusStopCode);
        }
      });

      const routes = Array.from(routesMap.values());
      logger.info(`Transformed ${routes.length} bus routes`);
      return routes;
    } catch (error) {
      logger.error('Error transforming bus routes data:', error);
      return [];
    }
  }

  static transformTrainAlertsData(apiData: any): any[] {
    if (!apiData?.value) {
      return [];
    }

    try {
      const alerts = apiData.value.map((alert: any) => ({
        line: alert.Line,
        status: alert.Status,
        message: alert.Message,
        timestamp: new Date().toISOString(),
      }));

      logger.info(`Transformed ${alerts.length} train alerts`);
      return alerts;
    } catch (error) {
      logger.error('Error transforming train alerts data:', error);
      return [];
    }
  }

  private static generateRouteColor(routeId: string): string {
    const colors = [
      '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6',
      '#1ABC9C', '#E67E22', '#34495E', '#F1C40F', '#E91E63'
    ];

    let hash = 0;
    for (let i = 0; i < routeId.length; i++) {
      hash = routeId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  static interpolateVehiclePosition(
    vehicle: Vehicle,
    targetPosition: { lat: number; lng: number },
    progress: number
  ): Vehicle {
    return {
      ...vehicle,
      position: {
        lat: vehicle.position.lat + (targetPosition.lat - vehicle.position.lat) * progress,
        lng: vehicle.position.lng + (targetPosition.lng - vehicle.position.lng) * progress,
      },
    };
  }

  static filterVehiclesByBounds(
    vehicles: Vehicle[],
    bounds: { north: number; south: number; east: number; west: number }
  ): Vehicle[] {
    return vehicles.filter(vehicle =>
      vehicle.position.lat >= bounds.south &&
      vehicle.position.lat <= bounds.north &&
      vehicle.position.lng >= bounds.west &&
      vehicle.position.lng <= bounds.east
    );
  }
}