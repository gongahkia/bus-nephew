import { DataTransformer } from '../../services/data/dataTransformer';

describe('DataTransformer', () => {
  describe('transformBusArrivalToVehicles', () => {
    it('should transform valid bus arrival data', () => {
      const mockApiData = {
        Services: [
          {
            ServiceNo: '10',
            NextBus: {
              EstimatedArrival: '2023-12-01T12:00:00+08:00',
              Latitude: '1.3521',
              Longitude: '103.8198',
              Bearing: '45',
            },
            NextBus2: {
              EstimatedArrival: '2023-12-01T12:05:00+08:00',
              Latitude: '1.3525',
              Longitude: '103.8202',
              Bearing: '90',
            },
          },
        ],
      };

      const vehicles = DataTransformer.transformBusArrivalToVehicles(mockApiData);

      expect(vehicles).toHaveLength(2);
      expect(vehicles[0]).toMatchObject({
        type: 'bus',
        position: { lat: 1.3521, lng: 103.8198 },
        heading: 45,
        route_id: '10',
      });
    });

    it('should handle empty or invalid data', () => {
      expect(DataTransformer.transformBusArrivalToVehicles({})).toEqual([]);
      expect(DataTransformer.transformBusArrivalToVehicles(null)).toEqual([]);
      expect(DataTransformer.transformBusArrivalToVehicles({ Services: [] })).toEqual([]);
    });

    it('should filter out invalid coordinates', () => {
      const mockApiData = {
        Services: [
          {
            ServiceNo: '10',
            NextBus: {
              EstimatedArrival: '2023-12-01T12:00:00+08:00',
              Latitude: '91', // Invalid latitude
              Longitude: '103.8198',
            },
          },
        ],
      };

      const vehicles = DataTransformer.transformBusArrivalToVehicles(mockApiData);
      expect(vehicles).toHaveLength(0);
    });
  });

  describe('transformBusStopsData', () => {
    it('should transform valid bus stops data', () => {
      const mockApiData = {
        value: [
          {
            BusStopCode: '01012',
            Description: 'Opp Raffles Hotel',
            Latitude: 1.29684825487647,
            Longitude: 103.85253591654006,
          },
          {
            BusStopCode: '01013',
            Description: 'Raffles Hotel',
            Latitude: 1.29770970610083,
            Longitude: 103.85253591654006,
          },
        ],
      };

      const stops = DataTransformer.transformBusStopsData(mockApiData);

      expect(stops).toHaveLength(2);
      expect(stops[0]).toMatchObject({
        id: '01012',
        name: 'Opp Raffles Hotel',
        position: { lat: 1.29684825487647, lng: 103.85253591654006 },
        routes: [],
      });
    });

    it('should handle empty data', () => {
      expect(DataTransformer.transformBusStopsData({})).toEqual([]);
      expect(DataTransformer.transformBusStopsData({ value: [] })).toEqual([]);
    });
  });

  describe('filterVehiclesByBounds', () => {
    it('should filter vehicles within bounds', () => {
      const vehicles = [
        {
          id: '1',
          type: 'bus' as const,
          position: { lat: 1.35, lng: 103.82 },
          heading: 0,
          timestamp: '2023-12-01T12:00:00Z',
        },
        {
          id: '2',
          type: 'bus' as const,
          position: { lat: 2.0, lng: 104.0 }, // Outside bounds
          heading: 0,
          timestamp: '2023-12-01T12:00:00Z',
        },
      ];

      const bounds = {
        north: 1.47,
        south: 1.16,
        east: 104.1,
        west: 103.6,
      };

      const filtered = DataTransformer.filterVehiclesByBounds(vehicles, bounds);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('interpolateVehiclePosition', () => {
    it('should interpolate vehicle position', () => {
      const vehicle = {
        id: '1',
        type: 'bus' as const,
        position: { lat: 1.0, lng: 103.0 },
        heading: 0,
        timestamp: '2023-12-01T12:00:00Z',
      };

      const targetPosition = { lat: 2.0, lng: 104.0 };
      const interpolated = DataTransformer.interpolateVehiclePosition(
        vehicle,
        targetPosition,
        0.5
      );

      expect(interpolated.position).toEqual({ lat: 1.5, lng: 103.5 });
      expect(interpolated.id).toBe('1');
    });
  });
});