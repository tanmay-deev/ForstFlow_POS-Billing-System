import React, { useState } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';

const CategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(ENDPOINTS.CATEGORIES, formData);
      toast.success('Category created successfully!');
      setFormData({ name: '', description: '' });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Category" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-default">
        <Input 
          label="Category Name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Ice Cream Cones"
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-chocolate dark:text-crema mb-tiny">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            rows="3"
            className="w-full bg-white dark:bg-mocha border border-gray-200 dark:border-cacao rounded px-default py-small text-slateGray dark:text-latte focus:outline-none focus:ring-2 focus:ring-caramel"
            placeholder="Brief description..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-section border-t border-gray-100 dark:border-cacao">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
