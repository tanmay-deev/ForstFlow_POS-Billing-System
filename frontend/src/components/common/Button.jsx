import React from 'react';

const Button = ({ children, variant = 'primary', size = 'default', className = '', ...props }) => {
  const baseStyle = 'inline-flex items-center justify-center rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-caramel text-white hover:bg-caramel/90',
    secondary: 'bg-white dark:bg-mocha border border-chocolate dark:border-cacao text-chocolate dark:text-crema hover:bg-vanilla dark:hover:bg-espresso',
    danger: 'bg-softRed text-white hover:bg-softRed/90',
    outline: 'border border-gray-300 dark:border-cacao text-slateGray dark:text-latte hover:bg-gray-50 dark:hover:bg-[#2A1F1D]',
    ghost: 'text-slateGray dark:text-latte hover:bg-vanilla dark:hover:bg-espresso hover:text-chocolate dark:hover:text-crema'
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
