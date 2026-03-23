import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { children } = this.props;
    if (this.state.hasError) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      let errorDetails = null;

      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error) {
            errorMessage = 'Erro de permissão no banco de dados.';
            errorDetails = (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left overflow-auto max-h-60">
                <p className="font-mono text-xs text-red-700 dark:text-red-400">
                  Operação: {parsedError.operationType}<br />
                  Caminho: {parsedError.path}<br />
                  Erro: {parsedError.error}
                </p>
              </div>
            );
          }
        }
      } catch (e) {
        // Not a JSON error message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 text-center ring-1 ring-slate-200 dark:ring-slate-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ops! Algo deu errado</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{errorMessage}</p>
            {errorDetails}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
