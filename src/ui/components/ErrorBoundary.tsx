/**
 * Error Boundary Component
 * Catches React errors and prevents the entire app from crashing
 */

import React, { Component, type ReactNode } from 'react';
import { logger } from '../../utils/Logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[ErrorBoundary] Component crashed:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#1a1e2e',
            border: '2px solid #f44336',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            textAlign: 'center',
            zIndex: 10000,
          }}
        >
          <h2 style={{ color: '#f44336', margin: '0 0 16px 0' }}>
            ⚠️ Something went wrong
          </h2>
          <p style={{ color: '#aaa', marginBottom: '20px' }}>
            A component error occurred. The app may not function correctly.
          </p>
          {this.state.error && (
            <details style={{ textAlign: 'left', marginBottom: '20px' }}>
              <summary style={{ color: '#888', cursor: 'pointer', marginBottom: '10px' }}>
                Error details
              </summary>
              <pre
                style={{
                  background: '#0f1219',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#f44336',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
