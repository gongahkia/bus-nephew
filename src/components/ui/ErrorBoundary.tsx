import React, { Component, ReactNode } from 'react';
import { logger } from '../../utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#2c3e50',
        color: 'white',
        fontFamily: 'monospace',
        padding: '40px',
        textAlign: 'center',
      };

      const buttonStyle: React.CSSProperties = {
        background: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        marginTop: '20px',
      };

      return (
        <div style={errorStyle}>
          <h2 style={{ marginBottom: '20px', color: '#e74c3c' }}>
            🚌 Bus Nephew Encountered an Error
          </h2>
          <p style={{ marginBottom: '10px', fontSize: '14px', maxWidth: '600px' }}>
            Something went wrong while loading the transit visualization.
            This could be due to network issues or problems with the LTA DataMall API.
          </p>
          {this.state.error && (
            <details style={{ margin: '20px 0', fontSize: '12px', color: '#bdc3c7' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
                Technical Details
              </summary>
              <pre style={{ textAlign: 'left', overflow: 'auto', maxWidth: '100%' }}>
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            style={buttonStyle}
            onClick={this.handleRetry}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#c0392b';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#e74c3c';
            }}
          >
            Try Again
          </button>
          <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '20px' }}>
            If the problem persists, check your internet connection and ensure
            you have a valid LTA DataMall API key configured.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}