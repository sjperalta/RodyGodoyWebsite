import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallbackRender?: (error: Error) => ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundaryBase extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep error details out of the UI, but log them for debugging.
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    const { error } = this.state;
    if (error) {
      if (typeof this.props.fallbackRender === 'function') {
        return this.props.fallbackRender(error);
      }
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <ErrorBoundaryBase
      fallbackRender={() => (
        <div className="min-h-screen bg-bg-light text-bg-dark flex flex-col items-center justify-center p-6 text-center">
          <h1 className="font-serif text-2xl mb-3">{t('admin.error_boundary_title')}</h1>
          <p className="text-slate-600 max-w-md mb-6">{t('admin.error_boundary_body')}</p>
          <a
            href="/"
            className="bg-bg-dark text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors inline-block"
          >
            {t('admin.back_home')}
          </a>
        </div>
      )}
    >
      {children}
    </ErrorBoundaryBase>
  );
}
