import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card hover:-translate-y-1 hover:shadow-medium ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
