import React from 'react';

export function Card({ 
  children, 
  variant = 'glass', 
  className = '', 
  onClick = null,
  ...props 
}) {
  const variantStyles = {
    glass: 'glass-card',
    gold: 'glass-card-gold',
    subtle: 'bg-black/50 backdrop-blur-sm border border-[#C58B4E]/30 rounded-2xl p-4'
  };

  return (
    <div 
      onClick={onClick}
      className={`${variantStyles[variant] || variantStyles.glass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
