import React from "react";
import { Link } from "react-router-dom";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Route render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4" role="alert">
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Something broke on this page. Try refreshing, or head back to your dashboard.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="neu-button px-4 py-2 text-sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
            <Link to="/main" className="btn-solid px-4 py-2 text-sm">
              Back to dashboard
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
