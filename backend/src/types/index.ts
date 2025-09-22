export interface HardwareDevice {
  id: string;
  name: string;
  type: 'display' | 'sensor' | 'controller' | 'kiosk';
  status: 'connected' | 'disconnected' | 'error';
  lastSeen: Date;
  config: Record<string, any>;
  capabilities: string[];
  location?: {
    lat: number;
    lng: number;
    description?: string;
  };
}

export interface WebSocketMessage {
  type: string;
  deviceId?: string;
  timestamp: string;
  data: any;
}

export interface TransitUpdate {
  vehicles: any[];
  routes: any[];
  stops: any[];
  lastUpdated: string;
}

export interface DeviceRegistration {
  name: string;
  type: HardwareDevice['type'];
  capabilities: string[];
  config?: Record<string, any>;
  location?: HardwareDevice['location'];
}

export interface NotificationRule {
  id: string;
  deviceId: string;
  condition: {
    type: 'arrival' | 'delay' | 'route_change' | 'service_alert';
    params: Record<string, any>;
  };
  action: {
    type: 'display' | 'sound' | 'light' | 'webhook';
    params: Record<string, any>;
  };
  enabled: boolean;
}