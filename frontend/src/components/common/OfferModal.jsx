import React, { useState } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';

const OfferModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
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
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        code: formData.code.toUpperCase()
      };
      await api.post(ENDPOINTS.OFFERS, payload);
      toast.success('Offer created successfully!');
      setFormData({ title: '', code: '', discountType: 'percentage', discountValue: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to create offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Discount Offer" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-default">
        <Input 
          label="Offer Title" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Summer Sale"
        />
        <Input 
          label="Offer Code" 
          name="code" 
          value={formData.code} 
          onChange={handleChange} 
          required 
          placeholder="e.g. SUMMER20"
          className="uppercase"
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-chocolate mb-tiny">Discount Type</label>
          <select 
            name="discountType" 
            value={formData.discountType} 
            onChange={handleChange} 
            className="w-full bg-white border border-gray-200 rounded px-default py-small text-slateGray focus:outline-none focus:ring-2 focus:ring-caramel"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>
        </div>
        <Input 
          label="Discount Value" 
          name="discountValue" 
          type="number"
          min="1"
          value={formData.discountValue} 
          onChange={handleChange} 
          required 
        />
        <div className="grid grid-cols-2 gap-default">
          <Input 
            label="Start Date" 
            name="startDate" 
            type="date"
            value={formData.startDate} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Expiry Date" 
            name="endDate" 
            type="date"
            value={formData.endDate} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="flex justify-end gap-3 pt-section border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Offer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OfferModal;
