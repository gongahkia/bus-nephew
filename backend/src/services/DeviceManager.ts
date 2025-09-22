import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { HardwareDevice, DeviceRegistration, WebSocketMessage } from '../types';

export class DeviceManager {
  private devices: Map<string, HardwareDevice> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  private heartbeatInterval: NodeJS.Timeout;

  constructor() {
    this.heartbeatInterval = setInterval(() => {
      this.checkHeartbeats();
    }, 30000);
  }

  public registerDevice(ws: WebSocket, registration: DeviceRegistration): string {
    const deviceId = uuidv4();
    const device: HardwareDevice = {
      id: deviceId,
      name: registration.name,
      type: registration.type,
      status: 'connected',
      lastSeen: new Date(),
      config: registration.config || {},
      capabilities: registration.capabilities,
      location: registration.location,
    };

    this.devices.set(deviceId, device);
    this.connections.set(deviceId, ws);

    this.sendToDevice(deviceId, {
      type: 'registration_success',
      deviceId,
      timestamp: new Date().toISOString(),
      data: { device },
    });

    console.log(`Device registered: ${device.name} (${deviceId})`);
    return deviceId;
  }

  public unregisterDevice(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = 'disconnected';
      this.connections.delete(deviceId);
      console.log(`Device disconnected: ${device.name} (${deviceId})`);
    }
  }

  public updateDeviceHeartbeat(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastSeen = new Date();
      if (device.status !== 'connected') {
        device.status = 'connected';
        console.log(`Device reconnected: ${device.name} (${deviceId})`);
      }
    }
  }

  public sendToDevice(deviceId: string, message: WebSocketMessage): boolean {
    const ws = this.connections.get(deviceId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`Failed to send message to device ${deviceId}:`, error);
        return false;
      }
    }
    return false;
  }

  public broadcastToDevices(message: WebSocketMessage, deviceFilter?: (device: HardwareDevice) => boolean): number {
    let sentCount = 0;

    this.devices.forEach((device, deviceId) => {
      if (!deviceFilter || deviceFilter(device)) {
        if (this.sendToDevice(deviceId, message)) {
          sentCount++;
        }
      }
    });

    return sentCount;
  }

  public broadcastTransitUpdate(transitData: any): void {
    const message: WebSocketMessage = {
      type: 'transit_update',
      timestamp: new Date().toISOString(),
      data: transitData,
    };

    const sentCount = this.broadcastToDevices(message, (device) =>
      device.capabilities.includes('transit_display') && device.status === 'connected'
    );

    console.log(`Transit update broadcast to ${sentCount} devices`);
  }

  public getDevice(deviceId: string): HardwareDevice | undefined {
    return this.devices.get(deviceId);
  }

  public getAllDevices(): HardwareDevice[] {
    return Array.from(this.devices.values());
  }

  public getConnectedDevices(): HardwareDevice[] {
    return this.getAllDevices().filter(device => device.status === 'connected');
  }

  public getDevicesByType(type: HardwareDevice['type']): HardwareDevice[] {
    return this.getAllDevices().filter(device => device.type === type);
  }

  public updateDeviceConfig(deviceId: string, config: Record<string, any>): boolean {
    const device = this.devices.get(deviceId);
    if (device) {
      device.config = { ...device.config, ...config };

      this.sendToDevice(deviceId, {
        type: 'config_update',
        deviceId,
        timestamp: new Date().toISOString(),
        data: { config: device.config },
      });

      return true;
    }
    return false;
  }

  private checkHeartbeats(): void {
    const now = new Date();
    const timeoutMs = 60000;

    this.devices.forEach((device, deviceId) => {
      if (device.status === 'connected') {
        const timeSinceLastSeen = now.getTime() - device.lastSeen.getTime();

        if (timeSinceLastSeen > timeoutMs) {
          device.status = 'error';
          console.warn(`Device timeout: ${device.name} (${deviceId})`);

          this.sendToDevice(deviceId, {
            type: 'heartbeat_timeout',
            deviceId,
            timestamp: new Date().toISOString(),
            data: { timeout: true },
          });
        }
      }
    });
  }

  public getStats() {
    const stats = {
      total: this.devices.size,
      connected: 0,
      disconnected: 0,
      error: 0,
      byType: {} as Record<string, number>,
    };

    this.devices.forEach(device => {
      stats[device.status]++;
      stats.byType[device.type] = (stats.byType[device.type] || 0) + 1;
    });

    return stats;
  }

  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    this.devices.clear();
    this.connections.clear();
  }
}