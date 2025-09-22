import { Vehicle, Route, BusStop, ViewConfig } from '../../types';
import { COLORS, ANIMATION, DEFAULT_MAP_CONFIG } from '../../constants';
import { interpolatePosition, calculateDistance } from '../../utils';

interface RenderData {
  vehicles: Vehicle[];
  routes: Route[];
  stops: BusStop[];
  viewConfig: ViewConfig;
}

export class VisualizationEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private isDragging = false;
  private lastMousePos = { x: 0, y: 0 };
  private viewState = {
    center: { ...DEFAULT_MAP_CONFIG.CENTER },
    zoom: DEFAULT_MAP_CONFIG.ZOOM,
  };

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  private latLngToScreen(lat: number, lng: number, viewConfig: ViewConfig): { x: number; y: number } {
    const centerOffset = {
      lat: lat - viewConfig.center.lat,
      lng: lng - viewConfig.center.lng,
    };

    const scale = Math.pow(2, viewConfig.zoom - 10) * 100000;

    let x = this.width / 2 + centerOffset.lng * scale;
    let y = this.height / 2 - centerOffset.lat * scale;

    if (viewConfig.mode === 'isometric') {
      const isoX = (x - y) * 0.5;
      const isoY = (x + y) * 0.25;
      x = isoX + this.width / 2;
      y = isoY + this.height / 3;
    }

    return { x, y };
  }

  private drawVehicle(vehicle: Vehicle, viewConfig: ViewConfig): void {
    const pos = this.latLngToScreen(vehicle.position.lat, vehicle.position.lng, viewConfig);

    if (pos.x < -50 || pos.x > this.width + 50 || pos.y < -50 || pos.y > this.height + 50) {
      return;
    }

    const size = Math.max(3, Math.min(12, viewConfig.zoom - 8));
    const color = vehicle.type === 'bus' ? COLORS.BUS : COLORS.TRAIN;

    this.ctx.save();
    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate((vehicle.heading * Math.PI) / 180);

    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;

    if (vehicle.type === 'bus') {
      this.ctx.fillRect(-size / 2, -size / 3, size, size * 0.66);
      this.ctx.strokeRect(-size / 2, -size / 3, size, size * 0.66);
    } else {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }

    this.ctx.restore();

    if (viewConfig.zoom > 14) {
      this.ctx.fillStyle = COLORS.TEXT_SECONDARY;
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        vehicle.route_id || vehicle.line || 'N/A',
        pos.x,
        pos.y + size + 12
      );
    }
  }

  private drawRoute(route: Route, stops: BusStop[], viewConfig: ViewConfig): void {
    if (viewConfig.selectedRoutes.length > 0 && !viewConfig.selectedRoutes.includes(route.id)) {
      return;
    }

    const routeStops = stops.filter(stop => route.stops.includes(stop.id));

    if (routeStops.length < 2) return;

    this.ctx.strokeStyle = route.color;
    this.ctx.lineWidth = Math.max(1, viewConfig.zoom - 10);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();

    let isFirstPoint = true;
    for (const stop of routeStops) {
      const pos = this.latLngToScreen(stop.position.lat, stop.position.lng, viewConfig);

      if (isFirstPoint) {
        this.ctx.moveTo(pos.x, pos.y);
        isFirstPoint = false;
      } else {
        this.ctx.lineTo(pos.x, pos.y);
      }
    }

    this.ctx.stroke();
  }

  private drawStop(stop: BusStop, viewConfig: ViewConfig): void {
    const pos = this.latLngToScreen(stop.position.lat, stop.position.lng, viewConfig);

    if (pos.x < -20 || pos.x > this.width + 20 || pos.y < -20 || pos.y > this.height + 20) {
      return;
    }

    const size = Math.max(2, Math.min(8, viewConfig.zoom - 12));

    if (size < 2) return;

    this.ctx.fillStyle = COLORS.UI_SECONDARY;
    this.ctx.strokeStyle = COLORS.TEXT_PRIMARY;
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    if (viewConfig.zoom > 15) {
      this.ctx.fillStyle = COLORS.TEXT_SECONDARY;
      this.ctx.font = '8px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(stop.name, pos.x, pos.y + size + 10);
    }
  }

  private drawGrid(viewConfig: ViewConfig): void {
    const gridSpacing = 50 / Math.pow(2, viewConfig.zoom - 12);
    const offsetX = (viewConfig.center.lng * 100) % gridSpacing;
    const offsetY = (viewConfig.center.lat * 100) % gridSpacing;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 0.5;

    this.ctx.beginPath();

    for (let x = -offsetX; x < this.width + gridSpacing; x += gridSpacing) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }

    for (let y = -offsetY; y < this.height + gridSpacing; y += gridSpacing) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }

    this.ctx.stroke();
  }

  private drawUI(data: RenderData): void {
    const padding = 20;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(padding, padding, 200, 100);

    this.ctx.fillStyle = COLORS.TEXT_PRIMARY;
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';

    const info = [
      `Mode: ${data.viewConfig.mode}`,
      `Zoom: ${data.viewConfig.zoom.toFixed(1)}`,
      `Vehicles: ${data.vehicles.length}`,
      `Routes: ${data.routes.length}`,
      `Updated: ${new Date().toLocaleTimeString()}`,
    ];

    info.forEach((text, index) => {
      this.ctx.fillText(text, padding + 10, padding + 20 + index * 15);
    });
  }

  public render(data: RenderData): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawGrid(data.viewConfig);

    data.routes.forEach(route => {
      this.drawRoute(route, data.stops, data.viewConfig);
    });

    data.stops.forEach(stop => {
      this.drawStop(stop, data.viewConfig);
    });

    data.vehicles.forEach(vehicle => {
      this.drawVehicle(vehicle, data.viewConfig);
    });

    this.drawUI(data);
  }

  public handleMouseDown(x: number, y: number): void {
    this.isDragging = true;
    this.lastMousePos = { x, y };
  }

  public handleMouseMove(x: number, y: number): Partial<ViewConfig> | null {
    if (!this.isDragging) return null;

    const deltaX = x - this.lastMousePos.x;
    const deltaY = y - this.lastMousePos.y;

    const scale = 1 / Math.pow(2, this.viewState.zoom - 10) / 100000;

    const newCenter = {
      lat: this.viewState.center.lat + deltaY * scale,
      lng: this.viewState.center.lng - deltaX * scale,
    };

    this.lastMousePos = { x, y };
    this.viewState.center = newCenter;

    return { center: newCenter };
  }

  public handleMouseUp(): void {
    this.isDragging = false;
  }

  public handleWheel(x: number, y: number, deltaY: number): Partial<ViewConfig> | null {
    const zoomFactor = deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(8, Math.min(18, this.viewState.zoom * zoomFactor));

    this.viewState.zoom = newZoom;

    return { zoom: newZoom };
  }
}