
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 bg-urgency-high/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-urgency-high text-2xl">⚠</span>
            </div>
            <h2 className="text-xl font-bold text-tactical-text font-mono mb-2">
              APPLICATION ERROR
            </h2>
            <p className="text-tactical-text/80 font-mono text-sm mb-4">
              Something went wrong. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-tactical-accent hover:bg-tactical-accent/80 text-tactical-bg font-mono px-4 py-2 rounded"
            >
              REFRESH PAGE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
