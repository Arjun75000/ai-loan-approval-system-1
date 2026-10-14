import React from "react";

export const EmptyState = ({ title, message, actionText, onAction, icon }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || "📊"}</div>
      <h3>{title || "No data available"}</h3>
      <p>{message || "There are no records to display at this time."}</p>
      {actionText && onAction && (
        <div style={{ marginTop: "16px" }}>
          <button className="btn btn-primary btn-sm" onClick={onAction}>
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
