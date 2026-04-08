import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function InputField({
  label,
  type = 'text',
  placeholder,
  className = '',
  id,
  multiline = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-2 items-start w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="font-jakarta font-medium text-[14px] text-[#040f0f]">
          {label}
        </label>
      )}
      <div className={`bg-white border border-[#090909] flex items-center p-3 rounded-[8px] w-full ${multiline ? 'h-auto' : ''}`}>
        {multiline ? (
          <textarea
            id={id}
            placeholder={placeholder}
            className="font-jakarta font-normal text-[14px] text-black w-full outline-none bg-transparent placeholder-[#a3a3a3] resize-none"
            rows={3}
            {...props}
          />
        ) : (
          <div className="flex w-full items-center">
            <input
              id={id}
              type={effectiveType}
              placeholder={placeholder}
              className="font-jakarta font-normal text-[14px] text-black w-full outline-none bg-transparent placeholder-[#a3a3a3]"
              {...props}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-black focus:outline-none flex-shrink-0"
              >
                {showPassword ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
