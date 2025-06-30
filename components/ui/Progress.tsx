import React from 'react';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '' }) => {
  return (
    <div className={`w-full bg-muted rounded-full h-3 overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}; 