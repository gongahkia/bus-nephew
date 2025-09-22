<<<<<<< HEAD
# Prompt to Claude Code

```txt
## Project Overview
Bus Nephew is an interactive, real-time transit visualization and monitoring tool that displays buses and trains operating within a user’s region using live data pulled from the Land Transport Authority’s DataMall APIs. Inspired by the minimalist design of Mini Metro and enhanced with hardware support, the application aims to provide rich, location-aware transit information similar to busauntie.com’s real-time bus finder capabilities. The system integrates data visualization with hardware interfaces for location tracking, notifications, or kiosk-style displays.

## Key Features
- Real-time bus and train location visualization leveraging LTA DataMall APIs.
- Hardware integration support for IoT devices or embedded platforms (e.g., Raspberry Pi, digital signage) displaying transit data.
- Functional parity with busauntie.com — live bus arrival times, route following, and user notifications.
- Mini Metro-inspired animated schematic showing vehicles as moving geometrical figures on routes.
- Toggle between top-down 2D and isometric perspective visualization modes.
- User interface for zoom, pan, route selection, and area focus.
- Modular architecture separating API ingestion, hardware interaction layer, visualization, and UI components.
- Automatic periodic refresh of live data (polling every 15-30 seconds).
- Resilient design with error handling for API outages and graceful hardware integration fallback.
- Cross-platform support (desktop browsers, kiosks, embedded screens).
- Modern React + TypeScript frontend with optional backend service for hardware communication if needed.

## Technical Requirements & Specifications

### Data Sources and API Usage
- Connect securely to LTA DataMall APIs for dynamic bus and train data.
- Authenticate with API keys for authorized access.
- Parse and normalize vehicle positions and route data.
- Implement automatic polling and data caching for performance and reliability.

### Hardware Support
- Provide APIs or websocket interfaces for hardware components to receive live transit updates.
- Enable configurations for deployment on IoT or embedded platforms (e.g., digital bus stops, info kiosks).
- Support hardware-triggered notifications or visual alerts based on transit conditions or user-defined rules.
- Design modularity to allow extension or adaptation to specific hardware peripherals and sensors.

### Visualization
- Create minimalist schematic route maps in Mini Metro style showing transit vehicle flow.
- Animate vehicles along routes with smooth position transitions.
- Implement two distinct perspectives: flat 2D map and isometric projection.
- Support interactive controls (zoom, pan, route filter).
- Responsive UI design for displays ranging from desktops to small embedded screens.

### Architecture
- Frontend SPA with React and TypeScript.
- Optional backend service (Node.js or lightweight server) to handle hardware device communication.
- State management using React context or Redux.
- Rendering optimized with canvas/WebGL for smooth animations.
- Componentized codebase with clearly separated concerns: data fetching, rendering, hardware interface, UI.

## Deliverables
- Complete project codebase with modular structure for easy extensibility.
- Full API integration with LTA DataMall.
- Hardware interaction layer with clear documentation and example integration.
- Detailed README with setup, architecture explanation, API usage, and hardware deployment instructions.
- Comprehensive tests (unit, integration, and hardware simulation).
- Code comments and documentation ensuring maintainability.

## Example Inputs and Outputs

### Example API Response (simplified)
```json
{
  "vehicles": [
    {
      "type": "bus",
      "route_id": "10",
      "position": {"lat": 1.29027, "lng": 103.851959},
      "heading": 80
    },
    {
      "type": "train",
      "line": "Circle",
      "position": {"lat": 1.300, "lng": 103.852},
      "heading": 180
    }
  ]
}
```

### Expected Behavior
- Visual display accurately reflects vehicle positions and movements updated in real-time.
- Hardware devices connected to the system receive live transit data and act accordingly (e.g., show info, sound alerts).
- User can switch visualization between 2D and isometric views, pan, and zoom routes.
- Robust fallback and error handling for data or hardware interruptions.

## Development Environment
- Node.js 20+
- React 18+ & TypeScript
- Vite or Create React App (CRA) bundler
- ESLint, Prettier configurations
- Jest + React Testing Library
- Optional backend with Node.js / Express for hardware websocket handling

## Notes for Claude Code
- Generate full multi-file project including frontend, optional backend for hardware, configs, and tests.
- Implement secure API key handling and data polling.
- Code modularly with clear hardware abstraction.
- Prioritize performant, lightweight rendering.
- Add inline code comments and detailed README documentation.
- Use lightweight open-source libraries for map projection and hardware interfacing where appropriate.
```

# Sample Linkedin Post

```txt
LinkedIn Post Draft for Next Thursday
Excited to share a project inspired by Singapore’s transport pulse — Bus Nephew! 🚍🚆

This real-time visualization tool uses live data from the LTA DataMall API, showing buses and trains moving smoothly around the city in a minimalist, Mini Metro-style interface.

But that’s not all — it’s designed for hardware integration, enabling IoT devices like info kiosks and digital signage to bring transit updates directly to the streets. Imagine waiting at your stop and seeing live transit flows, powered by open data and smart tech.

Looking forward to expanding this with the community and driving smarter, connected urban mobility! #UrbanTransit #SmartCity #IoT #OpenData #ReactJS #PublicTransport #Singapore
```

[![](https://img.shields.io/badge/bus_nephew_1.0.0-passing-green)](https://github.com/gongahkia/bus-nephew/releases/tag/1.0.0) 

# `Bus Nephew`

...

## Rationale

...

## Stack

...

## Screenshots

...

## Usage

...

## Support

...

## Architecture

...

## Legal

...

## Reference

...
=======
[![](https://img.shields.io/badge/bus_nephew_1.0.0-passing-green)](https://github.com/gongahkia/bus-nephew/releases/tag/1.0.0)

# 🚌 Bus Nephew

**Real-time Singapore Transit Visualization with Hardware Integration**

Bus Nephew is an interactive, real-time transit visualization and monitoring tool that displays buses and trains operating within Singapore using live data from the Land Transport Authority's DataMall APIs. Inspired by the minimalist design of Mini Metro and enhanced with hardware support, the application provides rich, location-aware transit information with IoT device integration capabilities.

## ✨ Features

- **Real-time Transit Visualization**: Live bus and train location tracking using LTA DataMall APIs
- **Mini Metro-inspired Design**: Clean, minimalist animated schematic showing vehicles as moving geometric figures
- **Dual View Modes**: Toggle between top-down 2D and isometric perspective visualization
- **Hardware Integration**: WebSocket-based system for IoT devices, digital signage, and embedded platforms
- **Interactive Controls**: Zoom, pan, route selection, and area focus capabilities
- **Performance Optimized**: Canvas/WebGL rendering with smooth animations and efficient data caching
- **Cross-platform Support**: Works on desktop browsers, mobile devices, kiosks, and embedded screens
- **Modular Architecture**: Clean separation of concerns for easy extensibility and maintenance

## 🛠 Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast development and building
- **Canvas/WebGL** for high-performance rendering
- **React Context** for state management
- **ESLint + Prettier** for code quality

### Backend (Optional Hardware Hub)
- **Node.js + Express** for WebSocket server
- **WebSocket (ws)** for real-time hardware communication
- **TypeScript** for type safety

### APIs & Data
- **LTA DataMall APIs** for live transit data
- **RESTful endpoints** for hardware device management
- **Real-time data polling** with intelligent caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended: Node.js 20+)
- LTA DataMall API Key ([Register here](https://datamall.lta.gov.sg/content/datamall/en.html))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bus-nephew.git
   cd bus-nephew
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your LTA DataMall API key:
   ```env
   VITE_LTA_API_KEY=your_lta_datamall_api_key_here
   VITE_LTA_BASE_URL=http://datamall2.mytransport.sg/ltaodataservice
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Hardware Integration (Optional)

To enable hardware device support:

1. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up backend environment**
   ```bash
   cp .env.example .env
   ```

3. **Start the hardware hub**
   ```bash
   npm run dev
   ```

4. **Enable hardware in frontend**
   ```env
   VITE_ENABLE_HARDWARE_INTEGRATION=true
   VITE_HARDWARE_WEBSOCKET_URL=ws://localhost:3001
   ```

## 📖 Usage

### Basic Navigation
- **Zoom**: Use mouse wheel or zoom controls
- **Pan**: Click and drag to move around the map
- **View Toggle**: Switch between 2D and isometric views
- **Route Filter**: Select specific routes to display

### Route Selection
1. Open the route filter panel (top right)
2. Check/uncheck routes to show/hide them
3. Use "Clear All" to show all routes

### Hardware Device Integration
1. Connect your hardware device to the WebSocket server
2. Send a device registration message
3. Receive real-time transit updates
4. Implement custom display logic for your device

## 🏗 Architecture

```
src/
├── components/           # React UI components
│   ├── visualization/    # Canvas and rendering engine
│   ├── controls/         # User interface controls
│   └── ui/              # Common UI components
├── services/            # Business logic and data services
│   ├── api/             # LTA DataMall integration
│   └── data/            # Data transformation and management
├── hardware/            # Hardware integration layer
│   ├── interfaces/      # Hardware communication interfaces
│   └── protocols/       # Device-specific protocols
├── context/             # React context providers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── constants/           # Application constants

backend/                 # Hardware hub (optional)
├── src/
│   ├── services/        # Device management
│   ├── types/           # Backend type definitions
│   └── server.ts        # WebSocket server
```

### Key Components

- **VisualizationEngine**: Handles Canvas/WebGL rendering and animations
- **DataManager**: Manages LTA API polling and data caching
- **HardwareInterface**: Provides WebSocket communication with devices
- **TransitContext**: Global state management for transit data

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- Unit tests for utility functions
- Component tests using React Testing Library
- Service layer integration tests
- Hardware communication tests

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_LTA_API_KEY` | LTA DataMall API key | Required |
| `VITE_LTA_BASE_URL` | LTA API base URL | `http://datamall2.mytransport.sg/ltaodataservice` |
| `VITE_API_POLLING_INTERVAL` | Data refresh interval (ms) | `30000` |
| `VITE_ENABLE_HARDWARE_INTEGRATION` | Enable hardware features | `false` |
| `VITE_HARDWARE_WEBSOCKET_URL` | Hardware hub WebSocket URL | `ws://localhost:3001` |
| `VITE_DEBUG_MODE` | Enable debug logging | `false` |

### Hardware Device Configuration

Example device registration:

```typescript
const config: HardwareConfig = {
  deviceName: 'Bus Stop Display #1',
  deviceType: 'display',
  capabilities: ['transit_display', 'notifications'],
  location: {
    lat: 1.3521,
    lng: 103.8198,
    description: 'Raffles Place MRT Station'
  },
  customConfig: {
    brightness: 80,
    refreshRate: 30
  }
};
```

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Hardware Hub Deployment

For Raspberry Pi or embedded devices:

```bash
# On your device
git clone https://github.com/yourusername/bus-nephew.git
cd bus-nephew/backend
npm install --production
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Workflow

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

## 📚 API Documentation

### LTA DataMall Integration

The application integrates with several LTA DataMall endpoints:

- **Bus Arrival**: Real-time bus arrival information
- **Bus Routes**: Bus service route information
- **Bus Stops**: Bus stop locations and details
- **Train Service Alerts**: MRT/LRT service disruptions

### Hardware WebSocket Protocol

Hardware devices communicate using JSON messages:

```javascript
// Device Registration
{
  "type": "device_registration",
  "data": {
    "name": "Display Device #1",
    "type": "display",
    "capabilities": ["transit_display"]
  }
}

// Transit Update
{
  "type": "transit_update",
  "data": {
    "vehicles": [...],
    "routes": [...],
    "lastUpdated": "2023-12-01T12:00:00Z"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**API Key Issues**
- Ensure your LTA DataMall API key is valid and active
- Check that the API key is correctly set in your `.env` file
- Verify you haven't exceeded API rate limits

**Hardware Connection Issues**
- Ensure the WebSocket server is running on the specified port
- Check network connectivity between devices
- Verify WebSocket URL is correct in environment variables

**Performance Issues**
- Reduce the number of visible routes for better performance
- Adjust the polling interval for less frequent updates
- Use hardware acceleration in your browser

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Land Transport Authority Singapore** for providing the DataMall APIs
- **Mini Metro** game for design inspiration
- **React and TypeScript communities** for excellent tooling
- **Open source contributors** who made this project possible

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/bus-nephew/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bus-nephew/discussions)
- **Email**: support@busnephew.com

---

**Made with ❤️ for Singapore's public transport enthusiasts**
>>>>>>> b3d6aee (feat(app): all new files)
