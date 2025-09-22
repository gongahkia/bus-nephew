# 🔧 Hardware Integration Guide

This guide explains how to integrate hardware devices with Bus Nephew for IoT displays, kiosks, and embedded applications.

## Overview

Bus Nephew supports hardware integration through a WebSocket-based protocol that allows real-time communication between the main application and connected devices. This enables deployment on:

- **Digital Signage**: Bus stop displays, station information boards
- **IoT Devices**: Raspberry Pi, Arduino with networking capabilities
- **Kiosks**: Interactive touchscreen terminals
- **Embedded Systems**: Custom hardware implementations

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Hardware Hub   │    │   IoT Device    │
│   (React App)   │◄──►│  (WebSocket)    │◄──►│   (Hardware)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Getting Started

### 1. Hardware Hub Setup

The hardware hub is a Node.js WebSocket server that manages device connections:

```bash
cd backend
npm install
npm run dev
```

The server will start on `ws://localhost:3001` by default.

### 2. Device Connection Protocol

Devices connect via WebSocket and communicate using JSON messages:

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Register the device
  ws.send(JSON.stringify({
    type: 'device_registration',
    data: {
      name: 'Bus Stop Display #1',
      type: 'display',
      capabilities: ['transit_display', 'notifications'],
      location: {
        lat: 1.3521,
        lng: 103.8198,
        description: 'Raffles Place MRT'
      }
    }
  }));
};
```

### 3. Device Types

#### Display Device
For screens showing transit information:

```javascript
const config = {
  deviceName: 'Stop Display #1',
  deviceType: 'display',
  capabilities: ['transit_display', 'notifications'],
  displaySettings: {
    width: 1920,
    height: 1080,
    brightness: 80,
    refreshRate: 30
  }
};
```

#### Sensor Device
For environmental or motion sensors:

```javascript
const config = {
  deviceName: 'Motion Sensor #1',
  deviceType: 'sensor',
  capabilities: ['motion_detection', 'passenger_counting'],
  sensorSettings: {
    type: 'motion',
    sensitivity: 75,
    pollInterval: 1000
  }
};
```

#### Kiosk Device
For interactive terminals:

```javascript
const config = {
  deviceName: 'Info Kiosk #1',
  deviceType: 'kiosk',
  capabilities: ['user_interaction', 'route_planning'],
  kioskSettings: {
    operatingHours: {
      start: '06:00',
      end: '23:00'
    },
    interactionTimeout: 30000
  }
};
```

## Message Protocol

### Device Registration

```javascript
{
  "type": "device_registration",
  "data": {
    "name": "Device Name",
    "type": "display|sensor|kiosk|controller",
    "capabilities": ["capability1", "capability2"],
    "config": {...},
    "location": {
      "lat": 1.3521,
      "lng": 103.8198,
      "description": "Location name"
    }
  }
}
```

### Heartbeat

```javascript
{
  "type": "heartbeat",
  "data": {
    "timestamp": "2023-12-01T12:00:00Z",
    "deviceInfo": {
      "name": "Device Name",
      "status": "operational"
    }
  }
}
```

### Transit Data Update

```javascript
{
  "type": "transit_update",
  "data": {
    "vehicles": [
      {
        "id": "bus_001",
        "type": "bus",
        "route_id": "10",
        "position": {"lat": 1.3521, "lng": 103.8198},
        "heading": 45,
        "timestamp": "2023-12-01T12:00:00Z"
      }
    ],
    "routes": [...],
    "stops": [...],
    "lastUpdated": "2023-12-01T12:00:00Z"
  }
}
```

## Example Implementations

### Raspberry Pi Display

```python
import asyncio
import websockets
import json
import time
from PIL import Image, ImageDraw, ImageFont

class BusNephewDisplay:
    def __init__(self, ws_url, device_config):
        self.ws_url = ws_url
        self.config = device_config
        self.transit_data = None

    async def connect(self):
        async with websockets.connect(self.ws_url) as websocket:
            # Register device
            await websocket.send(json.dumps({
                'type': 'device_registration',
                'data': self.config
            }))

            # Listen for messages
            async for message in websocket:
                await self.handle_message(json.loads(message))

    async def handle_message(self, message):
        if message['type'] == 'transit_update':
            self.transit_data = message['data']
            self.update_display()
        elif message['type'] == 'registration_success':
            print(f"Device registered: {message['data']['device']['id']}")

    def update_display(self):
        if not self.transit_data:
            return

        # Create display image
        img = Image.new('RGB', (800, 480), color='black')
        draw = ImageDraw.Draw(img)
        font = ImageFont.load_default()

        # Draw transit information
        y_offset = 20
        for vehicle in self.transit_data['vehicles'][:5]:
            text = f"Bus {vehicle['route_id']} - {vehicle['position']['lat']:.4f}, {vehicle['position']['lng']:.4f}"
            draw.text((20, y_offset), text, font=font, fill='white')
            y_offset += 30

        # Display on screen (implementation depends on your display)
        self.show_image(img)

    def show_image(self, img):
        # Implement based on your display hardware
        # e.g., for e-ink display, OLED, etc.
        pass

# Usage
config = {
    'name': 'Bus Stop Display Pi',
    'type': 'display',
    'capabilities': ['transit_display'],
    'location': {
        'lat': 1.3521,
        'lng': 103.8198,
        'description': 'Raffles Place'
    }
}

display = BusNephewDisplay('ws://your-server:3001', config)
asyncio.run(display.connect())
```

### Arduino ESP32 Example

```cpp
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

WebSocketsClient webSocket;

const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";
const char* websocket_server = "your.server.com";
const int websocket_port = 3001;

void setup() {
    Serial.begin(115200);

    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }

    // Connect to WebSocket
    webSocket.begin(websocket_server, websocket_port, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    webSocket.loop();

    // Send heartbeat every 30 seconds
    static unsigned long lastHeartbeat = 0;
    if (millis() - lastHeartbeat > 30000) {
        sendHeartbeat();
        lastHeartbeat = millis();
    }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_CONNECTED:
            Serial.println("WebSocket Connected");
            registerDevice();
            break;

        case WStype_TEXT:
            handleMessage((char*)payload);
            break;

        case WStype_DISCONNECTED:
            Serial.println("WebSocket Disconnected");
            break;
    }
}

void registerDevice() {
    DynamicJsonDocument doc(1024);
    doc["type"] = "device_registration";
    doc["data"]["name"] = "ESP32 Sensor #1";
    doc["data"]["type"] = "sensor";
    doc["data"]["capabilities"][0] = "environmental_monitoring";

    String message;
    serializeJson(doc, message);
    webSocket.sendTXT(message);
}

void sendHeartbeat() {
    DynamicJsonDocument doc(512);
    doc["type"] = "heartbeat";
    doc["data"]["timestamp"] = millis();
    doc["data"]["deviceInfo"]["status"] = "operational";

    String message;
    serializeJson(doc, message);
    webSocket.sendTXT(message);
}

void handleMessage(const char* payload) {
    DynamicJsonDocument doc(2048);
    deserializeJson(doc, payload);

    String type = doc["type"];

    if (type == "transit_update") {
        // Process transit data
        JsonArray vehicles = doc["data"]["vehicles"];
        Serial.printf("Received %d vehicles\n", vehicles.size());

        // Update your display/sensors/actuators here
    }
}
```

### Web-based Kiosk

```html
<!DOCTYPE html>
<html>
<head>
    <title>Bus Nephew Kiosk</title>
    <style>
        body {
            font-family: monospace;
            background: #1a1a1a;
            color: white;
            margin: 0;
            padding: 20px;
        }
        .vehicle {
            background: #333;
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
        }
        .status {
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 10px;
            background: #333;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="status">
        Status: <span id="status">Connecting...</span>
    </div>

    <h1>🚌 Bus Nephew Kiosk</h1>
    <div id="transit-data"></div>

    <script>
        class BusNephewKiosk {
            constructor(wsUrl) {
                this.wsUrl = wsUrl;
                this.ws = null;
                this.transitData = null;
                this.connect();
            }

            connect() {
                this.ws = new WebSocket(this.wsUrl);

                this.ws.onopen = () => {
                    document.getElementById('status').textContent = 'Connected';
                    this.register();
                };

                this.ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                };

                this.ws.onclose = () => {
                    document.getElementById('status').textContent = 'Disconnected';
                    setTimeout(() => this.connect(), 5000);
                };
            }

            register() {
                this.ws.send(JSON.stringify({
                    type: 'device_registration',
                    data: {
                        name: 'Web Kiosk #1',
                        type: 'kiosk',
                        capabilities: ['transit_display', 'user_interaction'],
                        location: {
                            lat: 1.3521,
                            lng: 103.8198,
                            description: 'Demo Location'
                        }
                    }
                }));
            }

            handleMessage(message) {
                switch (message.type) {
                    case 'transit_update':
                        this.transitData = message.data;
                        this.updateDisplay();
                        break;
                    case 'registration_success':
                        console.log('Device registered successfully');
                        break;
                }
            }

            updateDisplay() {
                if (!this.transitData) return;

                const container = document.getElementById('transit-data');
                container.innerHTML = '';

                this.transitData.vehicles.slice(0, 10).forEach(vehicle => {
                    const div = document.createElement('div');
                    div.className = 'vehicle';
                    div.innerHTML = `
                        <strong>${vehicle.type.toUpperCase()} ${vehicle.route_id || vehicle.line || 'N/A'}</strong><br>
                        Position: ${vehicle.position.lat.toFixed(4)}, ${vehicle.position.lng.toFixed(4)}<br>
                        Heading: ${vehicle.heading}°<br>
                        Updated: ${new Date(vehicle.timestamp).toLocaleTimeString()}
                    `;
                    container.appendChild(div);
                });
            }
        }

        // Initialize kiosk
        const kiosk = new BusNephewKiosk('ws://localhost:3001');

        // Send heartbeat every 30 seconds
        setInterval(() => {
            if (kiosk.ws && kiosk.ws.readyState === WebSocket.OPEN) {
                kiosk.ws.send(JSON.stringify({
                    type: 'heartbeat',
                    data: {
                        timestamp: new Date().toISOString(),
                        deviceInfo: {
                            name: 'Web Kiosk #1',
                            status: 'operational'
                        }
                    }
                }));
            }
        }, 30000);
    </script>
</body>
</html>
```

## Device Management API

### REST Endpoints

- `GET /api/devices` - List all devices
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id/config` - Update device configuration
- `POST /api/devices/:id/message` - Send message to device
- `POST /api/broadcast` - Broadcast message to multiple devices

### Example API Usage

```bash
# List all devices
curl http://localhost:3001/api/devices

# Update device configuration
curl -X PUT http://localhost:3001/api/devices/device-id/config \
  -H "Content-Type: application/json" \
  -d '{"brightness": 90, "refreshRate": 60}'

# Send custom message to device
curl -X POST http://localhost:3001/api/devices/device-id/message \
  -H "Content-Type: application/json" \
  -d '{"type": "custom_command", "data": {"action": "reboot"}}'
```

## Best Practices

### Security
- Use authentication tokens for production deployments
- Implement TLS/SSL for WebSocket connections
- Validate all incoming messages
- Implement rate limiting

### Reliability
- Implement automatic reconnection logic
- Handle network timeouts gracefully
- Store critical data locally on devices
- Implement heartbeat monitoring

### Performance
- Batch message sending when possible
- Implement message compression for large payloads
- Use efficient data formats (MessagePack, Protocol Buffers)
- Cache frequently accessed data

### Deployment
- Use environment variables for configuration
- Implement proper logging and monitoring
- Create device provisioning scripts
- Document hardware requirements

## Troubleshooting

### Common Issues

**Connection Problems**
- Check network connectivity
- Verify WebSocket URL and port
- Ensure firewall allows WebSocket traffic
- Check for certificate issues with WSS

**Registration Failures**
- Verify device configuration format
- Check for duplicate device names
- Ensure required capabilities are specified
- Validate location coordinates

**Performance Issues**
- Monitor message frequency and size
- Check device memory usage
- Optimize display update logic
- Implement message throttling

### Debug Tools

Enable debug logging in the hardware hub:

```bash
DEBUG=bus-nephew:* npm run dev
```

Monitor WebSocket traffic using browser developer tools or tools like `wscat`:

```bash
npm install -g wscat
wscat -c ws://localhost:3001
```

## Hardware Examples

### Supported Platforms
- **Raspberry Pi**: All models with network connectivity
- **ESP32/ESP8266**: Arduino-compatible microcontrollers
- **Intel NUC**: Compact PCs for kiosk applications
- **Orange Pi/Banana Pi**: Alternative single-board computers
- **Custom Linux devices**: Any device running Linux with network support

### Display Technologies
- **E-ink displays**: Low power, excellent readability
- **OLED/LCD panels**: High contrast, fast refresh
- **LED matrices**: Simple text/graphics display
- **Projectors**: Large-scale information display

### Sensors
- **PIR motion sensors**: Passenger detection
- **Temperature/humidity**: Environmental monitoring
- **Light sensors**: Automatic brightness adjustment
- **Sound level meters**: Noise monitoring

## Support

For hardware integration support:
- Check the [Hardware FAQ](FAQ.md#hardware)
- Join our [Discord community](https://discord.gg/busnephew)
- Submit issues on [GitHub](https://github.com/yourusername/bus-nephew/issues)
- Email hardware support: hardware@busnephew.com