import React from 'react';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-page text-slateGray dark:text-latte">
      <div className="w-12 h-12 border-4 border-vanilla border-t-caramel rounded-full animate-spin"></div>
      {text && <p className="mt-section font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export const EmptyState = ({ title, message, icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-page text-center">
      {Icon && <div className="w-20 h-20 bg-vanilla dark:bg-espresso rounded-full flex items-center justify-center text-caramel mb-section"><Icon size={40} /></div>}
      <h3 className="text-xl font-bold text-chocolate dark:text-crema mb-tiny">{title}</h3>
      <p className="text-slateGray dark:text-latte mb-section max-w-md">{message}</p>
      {action}
    </div>
  );
};

export default Loader;
