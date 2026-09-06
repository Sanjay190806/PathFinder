import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleClearState = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env?.DEV || window.location.hostname === 'localhost';
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center bg-bgBase text-textPrimary">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          
          <div className="max-w-2xl w-full bg-white/[0.02] border border-border-subtle rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-accentRed mb-2">
              {this.state.error?.message || "An unexpected rendering error occurred inside the UI component."}
            </p>
            {isDev && this.state.errorInfo?.componentStack && (
              <details className="mt-3 cursor-pointer">
                <summary className="text-xs text-textMuted select-none hover:text-textSecondary">
                  View component stack trace (Development only)
                </summary>
                <pre className="mt-2 p-3 bg-black/45 rounded text-[10px] font-mono text-textSecondary overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accentBlue text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleClearState}
              className="px-4 py-2 bg-white/[0.08] text-textPrimary text-xs font-semibold rounded-lg hover:bg-white/[0.15] transition border border-white/10"
            >
              Clear Local App State
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-white/[0.03] text-textSecondary text-xs font-semibold rounded-lg hover:bg-white/[0.08] transition border border-white/5"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

