import { HardwareInterface, HardwareConfig } from '../interfaces/HardwareInterface';
import { TransitData } from '../../types';
import { logger } from '../../utils';

export interface DisplayDeviceConfig extends HardwareConfig {
  deviceType: 'display';
  displaySettings: {
    width: number;
    height: number;
    brightness: number;
    refreshRate: number;
  };
}

export interface SensorDeviceConfig extends HardwareConfig {
  deviceType: 'sensor';
  sensorSettings: {
    type: 'proximity' | 'motion' | 'environmental';
    sensitivity: number;
    pollInterval: number;
  };
}

export interface KioskDeviceConfig extends HardwareConfig {
  deviceType: 'kiosk';
  kioskSettings: {
    operatingHours: {
      start: string;
      end: string;
    };
    interactionTimeout: number;
    displayRoutes: string[];
  };
}

export class DisplayDevice {
  private interface: HardwareInterface;

  constructor(config: DisplayDeviceConfig) {
    this.interface = new HardwareInterface(config);
    this.setupMessageHandlers();
  }

  public async initialize(): Promise<boolean> {
    const connected = await this.interface.connect();
    if (connected) {
      logger.info('Display device initialized successfully');
    }
    return connected;
  }

  public displayTransitData(data: TransitData): void {
    this.interface.sendMessage('display_transit', {
      vehicles: data.vehicles.slice(0, 10),
      routes: data.routes.slice(0, 5),
      lastUpdated: data.lastUpdated,
    });
  }

  public displayNotification(message: string, type: 'info' | 'warning' | 'alert' = 'info'): void {
    this.interface.sendMessage('display_notification', {
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  public updateBrightness(brightness: number): void {
    this.interface.sendMessage('set_brightness', { brightness });
  }

  public disconnect(): void {
    this.interface.disconnect();
  }

  private setupMessageHandlers(): void {
    this.interface.onMessage('display_ready', (data) => {
      logger.info('Display device ready:', data);
    });

    this.interface.onMessage('display_error', (data) => {
      logger.error('Display device error:', data);
    });
  }
}

export class SensorDevice {
  private interface: HardwareInterface;
  private onDataCallback?: (sensorData: any) => void;

  constructor(config: SensorDeviceConfig) {
    this.interface = new HardwareInterface(config);
    this.setupMessageHandlers();
  }

  public async initialize(): Promise<boolean> {
    const connected = await this.interface.connect();
    if (connected) {
      logger.info('Sensor device initialized successfully');
      this.startSensorPolling();
    }
    return connected;
  }

  public onSensorData(callback: (data: any) => void): void {
    this.onDataCallback = callback;
  }

  public requestSensorReading(): void {
    this.interface.sendMessage('read_sensor', {
      timestamp: new Date().toISOString(),
    });
  }

  public disconnect(): void {
    this.interface.disconnect();
  }

  private startSensorPolling(): void {
    setInterval(() => {
      this.requestSensorReading();
    }, 5000);
  }

  private setupMessageHandlers(): void {
    this.interface.onMessage('sensor_data', (data) => {
      logger.info('Received sensor data:', data);
      if (this.onDataCallback) {
        this.onDataCallback(data);
      }
    });

    this.interface.onMessage('sensor_error', (data) => {
      logger.error('Sensor device error:', data);
    });
  }
}

export class KioskDevice {
  private interface: HardwareInterface;
  private isOperational = false;

  constructor(config: KioskDeviceConfig) {
    this.interface = new HardwareInterface(config);
    this.setupMessageHandlers();
  }

  public async initialize(): Promise<boolean> {
    const connected = await this.interface.connect();
    if (connected) {
      logger.info('Kiosk device initialized successfully');
      this.checkOperatingHours();
    }
    return connected;
  }

  public displayWelcomeScreen(): void {
    this.interface.sendMessage('display_welcome', {
      title: 'Bus Nephew Transit Information',
      subtitle: 'Real-time Singapore Transit Data',
      timestamp: new Date().toISOString(),
    });
  }

  public displayRouteInformation(routes: string[]): void {
    this.interface.sendMessage('display_routes', {
      routes,
      timestamp: new Date().toISOString(),
    });
  }

  public handleUserInteraction(interactionType: string, data: any): void {
    this.interface.sendMessage('user_interaction', {
      type: interactionType,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  public setOperationalStatus(operational: boolean): void {
    this.isOperational = operational;
    this.interface.sendMessage('set_operational', {
      operational,
      timestamp: new Date().toISOString(),
    });
  }

  public disconnect(): void {
    this.interface.disconnect();
  }

  private checkOperatingHours(): void {
    setInterval(() => {
      const now = new Date();
      const hour = now.getHours();

      this.setOperationalStatus(hour >= 6 && hour <= 23);
    }, 60000);
  }

  private setupMessageHandlers(): void {
    this.interface.onMessage('user_touch', (data) => {
      logger.info('User interaction detected:', data);
      this.handleUserInteraction('touch', data);
    });

    this.interface.onMessage('kiosk_status', (data) => {
      logger.info('Kiosk status update:', data);
    });

    this.interface.onMessage('kiosk_error', (data) => {
      logger.error('Kiosk device error:', data);
    });
  }
}

export const createDevice = (config: HardwareConfig) => {
  switch (config.deviceType) {
    case 'display':
      return new DisplayDevice(config as DisplayDeviceConfig);
    case 'sensor':
      return new SensorDevice(config as SensorDeviceConfig);
    case 'kiosk':
      return new KioskDevice(config as KioskDeviceConfig);
    default:
      throw new Error(`Unsupported device type: ${config.deviceType}`);
  }
};