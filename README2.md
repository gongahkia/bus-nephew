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