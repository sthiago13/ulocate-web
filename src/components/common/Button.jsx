import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' or 'secondary'
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = "flex items-center justify-center p-3 rounded-[13px] h-[63px] transition-colors cursor-pointer w-full shrink-0";
  
  const variants = {
    primary: "bg-[#155dfc] hover:bg-blue-700 text-white font-inter text-[24px]",
    secondary: "bg-white hover:bg-gray-50 border border-[#4a4a4a] text-[#101828] font-jakarta text-[24px]"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
