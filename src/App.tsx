import React, { useState, useEffect } from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { Canvas } from './components/visualization/Canvas';
import { ViewControls } from './components/controls/ViewControls';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const BusNephewApp: React.FC = () => {
  const { transitData, viewConfig, isLoading, error, updateViewConfig } = useTransit();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#2c3e50',
        color: 'white',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '40px',
        textAlign: 'center',
      }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>
          ⚠️ Connection Error
        </h2>
        <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
          {error}
        </p>
        <p style={{ fontSize: '12px', color: '#7f8c8d' }}>
          Make sure you have set your LTA DataMall API key in the environment variables.
        </p>
      </div>
    );
  }

  if (isLoading || !transitData) {
    return <LoadingSpinner message="Initializing Bus Nephew..." />;
  }

  const availableRoutes = transitData.routes.map(route => route.id);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#1a1a1a',
    }}>
      <Canvas
        vehicles={transitData.vehicles}
        routes={transitData.routes}
        stops={transitData.stops}
        viewConfig={viewConfig}
        onViewConfigChange={updateViewConfig}
        width={dimensions.width}
        height={dimensions.height}
      />

      <ViewControls
        viewConfig={viewConfig}
        onViewConfigChange={updateViewConfig}
        availableRoutes={availableRoutes}
      />

      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px 15px',
        borderRadius: '6px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '12px',
      }}>
        🚌 Bus Nephew v1.0.0 | Data from LTA DataMall
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <TransitProvider>
        <BusNephewApp />
      </TransitProvider>
    </ErrorBoundary>
  );
}

export default App;
