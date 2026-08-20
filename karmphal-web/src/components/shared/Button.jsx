import React from 'react';

export function Button({ 
  children, 
  variant = 'gold', 
  size = 'md', 
  onClick, 
  disabled = false, 
  className = '', 
  type = 'button',
  icon: Icon = null,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-xl gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 rounded-xl sm:rounded-2xl gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 rounded-2xl gap-2.5'
  };

  const variantStyles = {
    gold: 'btn-gold',
    outline: 'bg-[#1C1008] border border-[#C58B4E]/40 text-[#F3CA9D] hover:border-[#E0A96D] hover:bg-[#2A180E]',
    ghost: 'bg-transparent text-[#D4A373] hover:text-[#FFF] hover:bg-white/5',
    circle: 'circle-gold-btn'
  };

  if (variant === 'circle') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`circle-gold-btn ${className}`}
        {...props}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.gold} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}

export default Button;
