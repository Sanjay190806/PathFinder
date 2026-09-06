import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';

interface Props {
  children?: ReactNode;
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
    console.error('ErrorBoundary captured a script error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6 text-center select-none">
          <Card className="max-w-md p-6 border-red-500/20 bg-red-500/5 flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black text-textPrimary uppercase tracking-tight">Sector Load Failure</h3>
              <p className="text-[10px] text-textSecondary leading-relaxed">
                An unexpected error occurred while loading this page. 
                Please reload the browser or clear local storage cache data.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition"
            >
              Retry Sector Load
            </button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
