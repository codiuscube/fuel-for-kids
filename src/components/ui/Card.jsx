import React from 'react';

export const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);
