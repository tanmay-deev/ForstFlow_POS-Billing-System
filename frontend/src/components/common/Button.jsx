import React from 'react';

const Button = ({ children, variant = 'primary', size = 'default', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-caramel text-white hover:bg-caramel/90',
    secondary: 'bg-white border border-chocolate text-chocolate hover:bg-vanilla',
    danger: 'bg-softRed text-white hover:bg-softRed/90',
    outline: 'border border-gray-300 text-slateGray hover:bg-gray-50',
    ghost: 'text-slateGray hover:bg-vanilla hover:text-chocolate'
  };

  const sizes = {
    small: 'px-small py-tiny text-sm',
    default: 'px-default py-small',
    large: 'px-section py-default text-lg'
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
