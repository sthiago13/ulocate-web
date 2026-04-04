import React from 'react';

export default function ResultCard({ 
  icon, 
  title, 
  subtitle,
  tags,
  expandedContent,
  actions,
  onClick,
  className = "" 
}) {
  return (
    <div 
      onClick={onClick}
      className={`group bg-[#f9f9f9] border border-[#d9d9d9] flex flex-col px-[20px] py-[15px] rounded-[15px] w-full hover:bg-gray-50 transition-colors shadow-sm relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      
      {/* Header Info */}
      <div className={`flex items-start justify-between w-full ${(tags || expandedContent || actions) ? 'mb-3' : ''}`}>
        <div className="flex gap-[15px] items-center w-full min-w-0">
          <div className="bg-[#fffabe] flex items-center justify-center rounded-[10px] w-[40px] h-[40px] shrink-0">
            {icon || <div className="w-6 h-6 bg-gray-200 rounded-full" />}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-sans font-bold text-[#101828] text-[15px] truncate">{title}</span>
            <span className="font-sans font-normal text-gray-500 text-[13px] truncate">{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Middle Content Slots (Tags & Notes) */}
      {(tags || expandedContent) && (
        <div className={`flex flex-col gap-2 ${actions ? 'mb-3' : ''}`}>
          {tags && <div>{tags}</div>}
          {expandedContent && <div>{expandedContent}</div>}
        </div>
      )}

      {/* Footer Actions Slot */}
      {actions && (
        <div 
          onClick={e => e.stopPropagation()} 
          className="flex flex-wrap gap-2 mt-auto w-full pt-3 border-t border-gray-200 justify-end"
        >
          {actions}
        </div>
      )}

    </div>
  );
}
