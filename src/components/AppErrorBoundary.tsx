import { Component, createRef, type ErrorInfo, type ReactNode } from 'react';
import { reportClientError } from '@/lib/monitoring';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export default class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };
  private readonly headingRef = createRef<HTMLHeadingElement>();

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportClientError(error, {
      source: 'react-error-boundary',
      componentStack: info.componentStack ?? 'unavailable',
    });
    this.headingRef.current?.focus();
  }

  private reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <section
          className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center"
          role="alert"
          aria-labelledby="app-error-title"
          aria-describedby="app-error-description"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            VertexED
          </p>
          <h1
            ref={this.headingRef}
            id="app-error-title"
            className="mt-4 text-3xl font-semibold tracking-tight"
            tabIndex={-1}
          >
            This page could not open
          </h1>
          <p id="app-error-description" className="mt-4 text-base leading-relaxed text-muted-foreground">
            A temporary loading error occurred. Reload the page to try again, or return home.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={this.reloadPage}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Reload page
            </button>
            <a
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Return home
            </a>
          </div>
        </section>
      </main>
    );
  }
}
