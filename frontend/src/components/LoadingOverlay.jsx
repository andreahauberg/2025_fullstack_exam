import React from "react";
import "../css/Loading.css";

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner" aria-label="Loading spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
};

export default LoadingOverlay;
