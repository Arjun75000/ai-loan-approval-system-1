import React from "react";

export const StatusBadge = ({ type, text }) => {
  let badgeClass = "badge";
  const normalized = (type || text || "").toLowerCase().replace(/[\s_-]+/g, "-");

  if (normalized.includes("approved")) {
    badgeClass += " badge-approved";
  } else if (normalized.includes("rejected")) {
    badgeClass += " badge-rejected";
  } else if (normalized.includes("very-high")) {
    badgeClass += " badge-very-high-risk";
  } else if (normalized.includes("high")) {
    badgeClass += " badge-high-risk";
  } else if (normalized.includes("medium")) {
    badgeClass += " badge-medium-risk";
  } else if (normalized.includes("low")) {
    badgeClass += " badge-low-risk";
  } else {
    badgeClass += " badge-medium-risk";
  }

  return <span className={badgeClass}>{text || type}</span>;
};
