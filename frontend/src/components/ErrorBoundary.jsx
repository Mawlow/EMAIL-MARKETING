import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="error-boundary-fallback">
          <p>Something went wrong. Please use the HTML tab to edit your email body.</p>
          {this.props.onRetry && (
            <button type="button" onClick={() => this.setState({ hasError: false })}>Try again</button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
