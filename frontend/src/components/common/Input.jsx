import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-chocolate dark:text-crema mb-tiny">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-white dark:bg-espresso border ${error ? 'border-softRed' : 'border-gray-200 dark:border-cacao'} rounded px-default py-small text-slateGray dark:text-latte focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent transition-all disabled:bg-gray-50 dark:disabled:bg-[#2A1F1D] disabled:text-gray-400 ${className}`}
        {...props}
      />
      {error && <p className="mt-tiny text-sm text-softRed">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
