import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' or 'secondary'
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = "flex items-center justify-center py-[10px] px-[20px] rounded-[16px] h-[52px] transition-all duration-200 cursor-pointer w-full font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 shrink-0 gap-2";
  
  const variants = {
    primary: "bg-[#155dfc] hover:bg-blue-700 text-white font-['Plus_Jakarta_Sans'] text-[16px] shadow-[0px_4px_10px_rgba(21,93,252,0.3)] hover:shadow-[0px_6px_14px_rgba(21,93,252,0.4)] focus:ring-blue-500",
    secondary: "bg-[#e9e9e9] hover:bg-gray-300 text-gray-700 font-['Plus_Jakarta_Sans'] text-[16px] focus:ring-gray-300 shadow-sm"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      aria-label={props['aria-label'] || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {children}
    </button>
  );
}
