export interface Vehicle {
  id: string;
  type: 'bus' | 'train';
  position: {
    lat: number;
    lng: number;
  };
  heading: number;
  route_id?: string;
  line?: string;
  speed?: number;
  timestamp: string;
}

export interface BusStop {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  routes: string[];
}

export interface Route {
  id: string;
  name: string;
  type: 'bus' | 'train';
  path: Array<{
    lat: number;
    lng: number;
  }>;
  stops: string[];
  color: string;
}

export interface ViewConfig {
  mode: '2d' | 'isometric';
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  selectedRoutes: string[];
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  status: 'success' | 'error';
  message?: string;
}

export interface HardwareDevice {
  id: string;
  name: string;
  type: 'display' | 'sensor' | 'controller';
  status: 'connected' | 'disconnected' | 'error';
  lastSeen: string;
  config: Record<string, any>;
}

export interface TransitData {
  vehicles: Vehicle[];
  routes: Route[];
  stops: BusStop[];
  lastUpdated: string;
}