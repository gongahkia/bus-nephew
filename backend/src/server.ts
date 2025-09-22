import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { DeviceManager } from './services/DeviceManager';
import { WebSocketMessage, DeviceRegistration } from './types';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const deviceManager = new DeviceManager();

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    devices: deviceManager.getStats(),
  });
});

app.get('/api/devices', (req, res) => {
  try {
    const devices = deviceManager.getAllDevices();
    res.json({
      success: true,
      data: devices,
      count: devices.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch devices',
    });
  }
});

app.get('/api/devices/:deviceId', (req, res) => {
  try {
    const device = deviceManager.getDevice(req.params.deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch device',
    });
  }
});

app.put('/api/devices/:deviceId/config', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid config data',
      });
    }

    const success = deviceManager.updateDeviceConfig(deviceId, config);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.json({
      success: true,
      message: 'Device config updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update device config',
    });
  }
});

app.post('/api/devices/:deviceId/message', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { type, data } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Message type is required',
      });
    }

    const message: WebSocketMessage = {
      type,
      deviceId,
      timestamp: new Date().toISOString(),
      data: data || {},
    };

    const success = deviceManager.sendToDevice(deviceId, message);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Device not found or not connected',
      });
    }

    res.json({
      success: true,
      message: 'Message sent to device',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send message to device',
    });
  }
});

app.post('/api/broadcast', (req, res) => {
  try {
    const { type, data, deviceFilter } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Message type is required',
      });
    }

    const message: WebSocketMessage = {
      type,
      timestamp: new Date().toISOString(),
      data: data || {},
    };

    let filter;
    if (deviceFilter) {
      filter = (device: any) => {
        if (deviceFilter.type && device.type !== deviceFilter.type) return false;
        if (deviceFilter.capabilities && !deviceFilter.capabilities.every((cap: string) => device.capabilities.includes(cap))) return false;
        if (deviceFilter.status && device.status !== deviceFilter.status) return false;
        return true;
      };
    }

    const sentCount = deviceManager.broadcastToDevices(message, filter);

    res.json({
      success: true,
      message: `Message broadcast to ${sentCount} devices`,
      sentCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast message',
    });
  }
});

wss.on('connection', (ws: WebSocket, req) => {
  console.log('New WebSocket connection established');
  let deviceId: string | null = null;

  ws.on('message', (data: WebSocket.Data) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'device_registration': {
          const registration: DeviceRegistration = message.data;
          deviceId = deviceManager.registerDevice(ws, registration);
          break;
        }

        case 'heartbeat':
          if (deviceId) {
            deviceManager.updateDeviceHeartbeat(deviceId);
            ws.send(JSON.stringify({
              type: 'heartbeat_ack',
              deviceId,
              timestamp: new Date().toISOString(),
              data: {},
            }));
          }
          break;

        case 'device_status':
          if (deviceId) {
            const device = deviceManager.getDevice(deviceId);
            if (device && message.data) {
              Object.assign(device.config, message.data);
            }
          }
          break;

        case 'transit_data_request':
          if (deviceId) {
            ws.send(JSON.stringify({
              type: 'transit_data_response',
              deviceId,
              timestamp: new Date().toISOString(),
              data: {
                message: 'Transit data integration not implemented in this demo',
              },
            }));
          }
          break;

        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        timestamp: new Date().toISOString(),
        data: { error: 'Invalid message format' },
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (deviceId) {
      deviceManager.unregisterDevice(deviceId);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    if (deviceId) {
      deviceManager.unregisterDevice(deviceId);
    }
  });

  ws.send(JSON.stringify({
    type: 'connection_established',
    timestamp: new Date().toISOString(),
    data: {
      message: 'Connected to Bus Nephew Hardware Hub',
      serverTime: new Date().toISOString(),
    },
  }));
});

const gracefulShutdown = () => {
  console.log('Shutting down server...');

  deviceManager.destroy();

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
  console.log(`🚌 Bus Nephew Hardware Hub running on port ${PORT}`);
  console.log(`WebSocket server ready for hardware connections`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});

export { app, server, deviceManager };