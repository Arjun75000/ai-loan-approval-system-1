import React from "react";

export const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <div>{message}</div>
    </div>
  );
};
