import React from 'react';

export const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-900 text-blue-200 border-blue-700",
    red: "bg-red-900 text-red-200 border-red-700",
    green: "bg-green-900 text-green-200 border-green-700",
    yellow: "bg-yellow-900 text-yellow-200 border-yellow-700",
    purple: "bg-purple-900 text-purple-200 border-purple-700",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${colors[color]} uppercase tracking-wider`}>
      {children}
    </span>
  );
};
