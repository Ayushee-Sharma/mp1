import { Component } from 'react';

class PrescriptionFormErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[Prescription form render error]', error, errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-3" role="alert">
          <p className="text-sm font-bold text-rose-800">
            The prescription form could not be displayed. Your current in-memory draft has been kept.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-2 rounded-lg bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            Try displaying the form again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PrescriptionFormErrorBoundary;
