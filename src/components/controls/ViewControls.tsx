import React from 'react';
import { ViewConfig } from '../../types';

interface ViewControlsProps {
  viewConfig: ViewConfig;
  onViewConfigChange: (config: Partial<ViewConfig>) => void;
  availableRoutes: string[];
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  viewConfig,
  onViewConfigChange,
  availableRoutes,
}) => {
  const handleModeToggle = () => {
    onViewConfigChange({
      mode: viewConfig.mode === '2d' ? 'isometric' : '2d',
    });
  };

  const handleZoomIn = () => {
    onViewConfigChange({
      zoom: Math.min(18, viewConfig.zoom + 1),
    });
  };

  const handleZoomOut = () => {
    onViewConfigChange({
      zoom: Math.max(8, viewConfig.zoom - 1),
    });
  };

  const handleRouteToggle = (routeId: string) => {
    const isSelected = viewConfig.selectedRoutes.includes(routeId);
    const newSelectedRoutes = isSelected
      ? viewConfig.selectedRoutes.filter(id => id !== routeId)
      : [...viewConfig.selectedRoutes, routeId];

    onViewConfigChange({
      selectedRoutes: newSelectedRoutes,
    });
  };

  const handleClearRoutes = () => {
    onViewConfigChange({
      selectedRoutes: [],
    });
  };

  const controlStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '15px',
    borderRadius: '8px',
    color: 'white',
    fontFamily: 'monospace',
    fontSize: '12px',
    minWidth: '200px',
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const buttonStyle: React.CSSProperties = {
    background: '#34495e',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    margin: '2px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#3498db',
  };

  return (
    <div style={controlStyle}>
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>View Controls</h4>

        <div style={{ marginBottom: '10px' }}>
          <button
            style={viewConfig.mode === '2d' ? activeButtonStyle : buttonStyle}
            onClick={handleModeToggle}
          >
            2D View
          </button>
          <button
            style={viewConfig.mode === 'isometric' ? activeButtonStyle : buttonStyle}
            onClick={handleModeToggle}
          >
            Isometric
          </button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button style={buttonStyle} onClick={handleZoomIn}>
            Zoom In (+)
          </button>
          <button style={buttonStyle} onClick={handleZoomOut}>
            Zoom Out (-)
          </button>
        </div>

        <div style={{ fontSize: '10px', color: '#bdc3c7' }}>
          Zoom: {viewConfig.zoom.toFixed(1)}
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Route Filter</h4>

        <div style={{ marginBottom: '10px' }}>
          <button style={buttonStyle} onClick={handleClearRoutes}>
            Clear All
          </button>
          <span style={{ marginLeft: '10px', fontSize: '10px', color: '#bdc3c7' }}>
            {viewConfig.selectedRoutes.length > 0
              ? `${viewConfig.selectedRoutes.length} selected`
              : 'All routes visible'}
          </span>
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {availableRoutes.slice(0, 20).map(routeId => (
            <label
              key={routeId}
              style={{
                display: 'block',
                margin: '4px 0',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              <input
                type="checkbox"
                checked={viewConfig.selectedRoutes.includes(routeId)}
                onChange={() => handleRouteToggle(routeId)}
                style={{ marginRight: '6px' }}
              />
              Route {routeId}
            </label>
          ))}
          {availableRoutes.length > 20 && (
            <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '8px' }}>
              ... and {availableRoutes.length - 20} more routes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};