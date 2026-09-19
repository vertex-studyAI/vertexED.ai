import React from "react";
import { Link } from "react-router";
import { reportClientError } from "@/lib/monitoring";

type Props = { children: React.ReactNode; resetKey: string };
type State = { hasError: boolean };

export default class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };
  private readonly headingRef = React.createRef<HTMLHeadingElement>();

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportClientError(error, {
      source: 'route-error-boundary',
      componentStack: info.componentStack ?? 'unavailable',
    });
    window.requestAnimationFrame(() => this.headingRef.current?.focus({ preventScroll: true }));
  }

  componentDidUpdate(previousProps: Props) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4"
          role="alert"
          aria-labelledby="route-error-title"
          aria-describedby="route-error-description"
        >
          <h2
            ref={this.headingRef}
            id="route-error-title"
            tabIndex={-1}
            className="text-xl font-semibold text-foreground"
          >
            This page could not open
          </h2>
          <p id="route-error-description" className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Your saved work has not been changed. Try this page again, or return home and choose another study tool.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="neu-button px-4 py-2 text-sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
            <Link to="/" className="btn-solid px-4 py-2 text-sm">
              Return home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
