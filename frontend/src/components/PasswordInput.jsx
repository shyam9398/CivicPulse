import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

/**
 * Reusable password input with a show/hide toggle button on the right.
 */
export const PasswordInput = ({
  label = 'Password',
  id = 'password',
  name = 'password',
  value,
  onChange,
  onBlur,
  placeholder = '••••••••',
  error,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault(); // prevent form submits
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        <label 
          htmlFor={id} 
          className="text-xs font-semibold uppercase tracking-wider text-slate-500 select-none"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>

      <div className="relative rounded-lg group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
          <Lock size={18} className="transition-transform duration-300 group-focus-within:scale-110" />
        </div>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full py-2.5 pl-10 pr-10 
            bg-white border text-sm text-slate-800 rounded-lg outline-none
            transition-all duration-200
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20' 
              : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'
            }
          `}
          {...props}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          tabIndex={0}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:text-primary-500 focus:outline-none transition-colors"
        >
          {showPassword ? (
            <EyeOff size={18} className="animate-pulse-subtle" />
          ) : (
            <Eye size={18} className="animate-pulse-subtle" />
          )}
        </button>
      </div>

      {error && (
        <span 
          id={`${id}-error`} 
          className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5"
          role="alert"
        >
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;
