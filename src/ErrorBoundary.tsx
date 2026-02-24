import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
          <h1 className="serif" style={{ fontSize: '2em', color: '#5A5A40', marginBottom: '10px' }}>
            Ups! Etwas ist schiefgelaufen.
          </h1>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Wir konnten die Anwendung nicht laden.
          </p>
          <div style={{
            padding: '15px',
            background: '#ffebee',
            color: '#b71c1c',
            borderRadius: '8px',
            textAlign: 'left',
            display: 'inline-block',
            maxWidth: '100%',
            overflow: 'auto'
          }}>
            <strong>Fehler:</strong> {this.state.error?.message}
            <br />
            <pre style={{ fontSize: '0.8em', marginTop: '10px' }}>
              {this.state.error?.stack}
            </pre>
          </div>
          <br />
          <button
            onClick={() => window.location.reload()}
            className="olive-button"
            style={{ marginTop: '20px', cursor: 'pointer' }}
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
