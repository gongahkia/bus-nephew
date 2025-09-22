import { HardwareDevice, WebSocketMessage } from '../../types';
import { HARDWARE_CONFIG } from '../../constants';
import { logger } from '../../utils';

export interface HardwareCapability {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface HardwareConfig {
  deviceName: string;
  deviceType: 'display' | 'sensor' | 'controller' | 'kiosk';
  capabilities: string[];
  location?: {
    lat: number;
    lng: number;
    description?: string;
  };
  customConfig?: Record<string, any>;
}

export class HardwareInterface {
  private ws: WebSocket | null = null;
  private config: HardwareConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor(config: HardwareConfig) {
    this.config = config;
  }

  public async connect(): Promise<boolean> {
    if (!HARDWARE_CONFIG.ENABLED) {
      logger.warn('Hardware integration is disabled');
      return false;
    }

    try {
      this.ws = new WebSocket(HARDWARE_CONFIG.WEBSOCKET_URL);

      this.ws.onopen = () => {
        logger.info('Hardware WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.registerDevice();
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        logger.warn('Hardware WebSocket disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        logger.error('Hardware WebSocket error:', error);
        this.isConnected = false;
      };

      return true;
    } catch (error) {
      logger.error('Failed to connect to hardware hub:', error);
      return false;
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.isConnected = false;
      this.stopHeartbeat();
      this.ws.close();
      this.ws = null;
    }
  }

  public sendMessage(type: string, data: any): boolean {
    if (!this.isConnected || !this.ws) {
      logger.warn('Cannot send message: not connected to hardware hub');
      return false;
    }

    try {
      const message: WebSocketMessage = {
        type,
        timestamp: new Date().toISOString(),
        data,
      };

      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error('Failed to send hardware message:', error);
      return false;
    }
  }

  public onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  public removeMessageHandler(type: string): void {
    this.messageHandlers.delete(type);
  }

  public updateConfig(newConfig: Partial<HardwareConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.isConnected) {
      this.sendMessage('config_update', {
        config: this.config.customConfig,
      });
    }
  }

  public getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    lastError?: string;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  private registerDevice(): void {
    this.sendMessage('device_registration', {
      name: this.config.deviceName,
      type: this.config.deviceType,
      capabilities: this.config.capabilities,
      config: this.config.customConfig || {},
      location: this.config.location,
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage('heartbeat', {
        timestamp: new Date().toISOString(),
        deviceInfo: {
          name: this.config.deviceName,
          type: this.config.deviceType,
        },
      });
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    } else {
      switch (message.type) {
        case 'connection_established':
          logger.info('Hardware connection established:', message.data);
          break;

        case 'registration_success':
          logger.info('Device registration successful:', message.data);
          break;

        case 'transit_update':
          logger.info('Received transit update:', message.data);
          break;

        case 'config_update':
          logger.info('Received config update:', message.data);
          if (message.data.config) {
            this.config.customConfig = { ...this.config.customConfig, ...message.data.config };
          }
          break;

        case 'heartbeat_ack':
          break;

        case 'error':
          logger.error('Hardware hub error:', message.data);
          break;

        default:
          logger.warn(`Unhandled message type: ${message.type}`);
      }
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= HARDWARE_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnection attempts reached. Giving up.');
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${HARDWARE_CONFIG.MAX_RECONNECT_ATTEMPTS})...`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, HARDWARE_CONFIG.RECONNECT_INTERVAL);
  }
}

export const createHardwareInterface = (config: HardwareConfig): HardwareInterface => {
  return new HardwareInterface(config);
};