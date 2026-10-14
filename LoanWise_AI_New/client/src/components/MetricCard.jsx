import React from "react";

export const MetricCard = ({ label, value, subtext, icon, highlightColor }) => {
  return (
    <div className="metric-card" style={highlightColor ? { borderTop: `3px solid ${highlightColor}` } : {}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="metric-label">{label}</div>
          <div className="metric-value">{value}</div>
          {subtext && <div className="metric-subtext">{subtext}</div>}
        </div>
        {icon && (
          <div style={{ padding: "8px", borderRadius: "8px", background: "var(--bg-tertiary)", color: "var(--accent-primary)" }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
