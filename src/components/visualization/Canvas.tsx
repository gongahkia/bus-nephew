import React, { useRef, useEffect, useCallback } from 'react';
import { Vehicle, Route, BusStop, ViewConfig } from '../../types';
import { VisualizationEngine } from './VisualizationEngine';

interface CanvasProps {
  vehicles: Vehicle[];
  routes: Route[];
  stops: BusStop[];
  viewConfig: ViewConfig;
  onViewConfigChange: (config: Partial<ViewConfig>) => void;
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  vehicles,
  routes,
  stops,
  viewConfig,
  onViewConfigChange,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VisualizationEngine | null>(null);
  const animationFrameRef = useRef<number>();

  const initializeEngine = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    engineRef.current = new VisualizationEngine(ctx, width, height);
  }, [width, height]);

  const animate = useCallback(() => {
    if (!engineRef.current) return;

    engineRef.current.render({
      vehicles,
      routes,
      stops,
      viewConfig,
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [vehicles, routes, stops, viewConfig]);

  useEffect(() => {
    initializeEngine();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeEngine]);

  useEffect(() => {
    if (engineRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animate();
    }
  }, [animate]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    engineRef.current.handleMouseDown(x, y);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newViewConfig = engineRef.current.handleMouseMove(x, y);
    if (newViewConfig) {
      onViewConfigChange(newViewConfig);
    }
  }, [onViewConfigChange]);

  const handleMouseUp = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.handleMouseUp();
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!engineRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newViewConfig = engineRef.current.handleWheel(x, y, event.deltaY);
    if (newViewConfig) {
      onViewConfigChange(newViewConfig);
    }
  }, [onViewConfigChange]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      style={{
        cursor: 'grab',
        display: 'block',
        background: '#1a1a1a',
      }}
    />
  );
};