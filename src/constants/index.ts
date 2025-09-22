export const API_ENDPOINTS = {
  BUS_ARRIVAL: '/BusArrivalv2',
  BUS_ROUTES: '/BusRoutes',
  BUS_STOPS: '/BusStops',
  BUS_SERVICES: '/BusServices',
  TRAIN_SERVICE_ALERTS: '/TrainServiceAlerts',
} as const;

export const SINGAPORE_BOUNDS = {
  NORTH: 1.47,
  SOUTH: 1.16,
  EAST: 104.1,
  WEST: 103.6,
} as const;

export const DEFAULT_MAP_CONFIG = {
  CENTER: {
    lat: Number(import.meta.env.VITE_DEFAULT_MAP_CENTER_LAT) || 1.3521,
    lng: Number(import.meta.env.VITE_DEFAULT_MAP_CENTER_LNG) || 103.8198,
  },
  ZOOM: Number(import.meta.env.VITE_DEFAULT_ZOOM_LEVEL) || 12,
} as const;

export const POLLING_INTERVALS = {
  API_DATA: Number(import.meta.env.VITE_API_POLLING_INTERVAL) || 30000,
  HARDWARE_HEARTBEAT: 10000,
  UI_REFRESH: 1000,
} as const;

export const COLORS = {
  BUS: '#E74C3C',
  TRAIN: '#3498DB',
  ROUTE_DEFAULT: '#95A5A6',
  BACKGROUND: '#2C3E50',
  UI_PRIMARY: '#34495E',
  UI_SECONDARY: '#7F8C8D',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#BDC3C7',
} as const;

export const ANIMATION = {
  VEHICLE_SPEED: 1000,
  TRANSITION_DURATION: 300,
  INTERPOLATION_STEPS: 60,
} as const;

export const HARDWARE_CONFIG = {
  WEBSOCKET_URL: import.meta.env.VITE_HARDWARE_WEBSOCKET_URL || 'ws://localhost:3001',
  ENABLED: import.meta.env.VITE_ENABLE_HARDWARE_INTEGRATION === 'true',
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;