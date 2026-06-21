import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-chocolate mb-tiny">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-white border ${error ? 'border-softRed' : 'border-gray-200'} rounded px-default py-small text-slateGray focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
        {...props}
      />
      {error && <p className="mt-tiny text-sm text-softRed">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
