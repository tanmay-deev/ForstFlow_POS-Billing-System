import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';

const CustomerModal = ({ isOpen, onClose, onSuccess, editingCustomer = null }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCustomer && isOpen) {
      setFormData({
        fullName: editingCustomer.fullName || editingCustomer.name || '',
        email: editingCustomer.email || '',
        phone: editingCustomer.phone || '',
      });
    } else if (isOpen) {
      setFormData({ fullName: '', email: '', phone: '' });
    }
  }, [editingCustomer, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        await api.put(`${ENDPOINTS.CUSTOMERS}/${editingCustomer._id}`, formData);
        toast.success('Customer updated successfully!');
      } else {
        await api.post(ENDPOINTS.CUSTOMERS, formData);
        toast.success('Customer created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingCustomer ? "Edit Customer" : "Add New Customer"} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-default">
        <Input 
          label="Full Name" 
          name="fullName" 
          value={formData.fullName} 
          onChange={handleChange} 
          required 
          placeholder="e.g. John Doe"
        />
        <Input 
          label="Email Address" 
          name="email" 
          type="email"
          value={formData.email} 
          onChange={handleChange} 
          placeholder="john@example.com"
        />
        <Input 
          label="Phone Number" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          required 
          placeholder="e.g. 1234567890"
        />

        <div className="flex justify-end gap-3 pt-section border-t border-gray-100 dark:border-cacao">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;
