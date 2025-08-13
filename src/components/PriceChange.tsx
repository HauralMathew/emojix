import React from 'react';

interface PriceChangeProps {
  value: number;
  showPlus?: boolean;
  className?: string;
}

const PriceChange: React.FC<PriceChangeProps> = ({ 
  value, 
  showPlus = true, 
  className = "" 
}) => {
  const displayValue = isNaN(value) ? 0 : value;
  const formattedValue = displayValue.toFixed(2);
  const isPositive = displayValue >= 0;
  const isZero = displayValue === 0;
  
  return (
    <span className={`text-sm font-semibold ${isZero ? 'text-text' : isPositive ? 'text-green-400' : 'text-red-400'} ${className}`}>
      {showPlus && isPositive && !isZero ? '+' : ''}{formattedValue}%
    </span>
  );
};

export default PriceChange; 