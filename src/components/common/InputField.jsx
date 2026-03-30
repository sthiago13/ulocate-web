import React from 'react';

export default function InputField({
  label,
  type = 'text',
  placeholder,
  className = '',
  id,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 items-start w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="font-jakarta font-medium text-[14px] text-[#040f0f]">
          {label}
        </label>
      )}
      <div className="bg-white border border-[#090909] flex items-center p-3 rounded-[8px] w-full">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="font-jakarta font-normal text-[14px] text-black w-full outline-none bg-transparent placeholder-[#a3a3a3]"
          {...props}
        />
      </div>
    </div>
  );
}
