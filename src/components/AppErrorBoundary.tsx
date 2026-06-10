import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

type Props = { children: ReactNode };

type State = { hasError: boolean; error?: Error };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info);
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
        <div className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-10">
          <div className="flex items-center gap-3 text-white">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">Something glitched in the workspace</h1>
              <p className="mt-1 text-sm text-white/65">The app caught the error before it could take the whole page down.</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            {this.state.error?.message || "An unexpected error occurred."}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
