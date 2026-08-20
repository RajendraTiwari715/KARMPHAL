import React from 'react';

export function Badge({ 
  children, 
  variant = 'gold', 
  className = '', 
  icon: Icon = null 
}) {
  const variantStyles = {
    gold: 'badge-gold',
    saffron: 'badge-saffron',
    emerald: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1',
    rose: 'bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1'
  };

  return (
    <span className={`${variantStyles[variant] || variantStyles.gold} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}

export default Badge;
