import React from "react";
import "../css/Loading.css";

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="loading-overlay" role="alert" aria-busy="true">
      <div className="spinner" role="status" aria-label="Loading" />
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingOverlay;
