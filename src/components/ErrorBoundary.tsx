import { Component, type ReactNode, type ErrorInfo } from 'react';
import { reportError } from '../lib/errorLog';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** 最上層錯誤邊界：任何未捕捉的渲染錯誤都顯示可重試的畫面，而不是白屏 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] app crashed:', error, info);
    reportError(error, 'react');
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6 text-center"
          style={{ background: '#0D1B2E', color: '#EAF2FB' }}
        >
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary mb-3">
              System anomaly
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="font-mono text-xs text-ink-muted mb-6">
              The world failed to load. Please reload.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-primary text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer border-none hover:opacity-90 transition-opacity"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
