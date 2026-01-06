'use client';

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component trees, logs them, and displays
 * a fallback UI instead of crashing the entire app.
 *
 * @feature 013-visual-story-builder
 */

import { Component, ReactNode } from 'react';
import { Button } from './button';
import { Card } from './card';

export interface ErrorBoundaryProps {
  children: ReactNode;
  Fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Card className="max-w-md p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error?.message || 'An error occurred while loading the story builder.'}
        </p>
        <Button onClick={reset} variant="outline" className="w-full">
          Try again
        </Button>
      </Card>
    </div>
  );
}

/**
 * Error Boundary Class Component
 *
 * Wraps child components to catch and handle errors gracefully.
 * Usage:
 * ```tsx
 * <ErrorBoundary Fallback={CustomFallback}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { Fallback = DefaultErrorFallback } = this.props;
      return <Fallback error={this.state.error} reset={this.handleReset} />;
    }

    return this.props.children;
  }
}
