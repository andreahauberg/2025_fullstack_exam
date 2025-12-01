import React from "react";
import { Link } from "react-router-dom";
import "../css/App.css";
import "../css/404.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "" };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled client error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div id="container">
          <main className="notfound-main">
            <h1>Something went wrong</h1>
            <p>We hit an unexpected error in the page. Try reloading.</p>
            {this.state.message ? <p className="error-code">{this.state.message}</p> : null}
            <div className="notfound-actions">
              <button className="btn-link" onClick={this.handleReload}>
                Reload
              </button>
              <Link to="/" className="btn-link">
                Go to start
              </Link>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
