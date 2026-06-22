import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  // Handle ESC close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-chocolate/50 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-white/95 dark:bg-mocha/95 backdrop-blur-2xl border border-white dark:border-cacao/50 rounded-2xl shadow-strong overflow-hidden flex flex-col max-h-[90vh]`}
          >
            <div className="p-section border-b border-gray-100 dark:border-cacao flex items-center justify-between">
              <h3 className="text-xl font-bold text-chocolate dark:text-crema">{title}</h3>
              <button type="button" onClick={onClose} className="text-slateGray dark:text-latte hover:text-softRed transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-section overflow-y-auto flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use createPortal to render modal outside the DOM hierarchy (e.g., at the end of body)
  return createPortal(modalContent, document.body);
};

export default Modal;
