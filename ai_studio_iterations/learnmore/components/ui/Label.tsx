import React, { LabelHTMLAttributes } from 'react';

export const Label: React.FC<LabelHTMLAttributes<HTMLLabelElement>> = ({ className = '', children, ...props }) => {
  return (
    <label
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};