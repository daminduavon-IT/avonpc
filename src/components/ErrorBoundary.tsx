import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere below it and shows a fallback UI
 * instead of unmounting the whole app to a blank white screen.
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted p-6">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-8">
              An unexpected error occurred. Please reload the page — if the
              problem persists, contact us and we'll help right away.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
