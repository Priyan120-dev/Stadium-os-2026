/**
 * ErrorBoundary.tsx — Global React Error Boundary
 */
'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian-dark flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-obsidian-card border border-stadium-red/35 rounded-2xl p-6 text-center shadow-neon-red flex flex-col items-center gap-4">
            <div className="p-3 bg-stadium-red/10 border border-stadium-red/25 rounded-full text-stadium-red">
              <AlertOctagon className="h-8 w-8" />
            </div>
            
            <h2 className="font-display font-extrabold text-lg text-white uppercase tracking-wider">
              Component Crash Intercepted
            </h2>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              The decentralised multi-agent monitoring network caught a rendering failure. 
              Rest assured, critical life-safety systems remain active.
            </p>

            {this.state.error && (
              <div className="w-full bg-white/5 border border-white/8 rounded-xl p-3 text-[10px] text-stadium-red font-mono text-left max-h-[100px] overflow-y-auto break-all">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="mt-2 w-full py-2.5 bg-stadium-red text-white hover:bg-stadium-red/85 font-display font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
              aria-label="Reload System Console"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reload System Console
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
