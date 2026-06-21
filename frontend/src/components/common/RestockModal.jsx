import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';

const RestockModal = ({ isOpen, onClose, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: 'New Supply'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get(ENDPOINTS.PRODUCTS)
        .then(res => setProducts(res.data.data))
        .catch(() => toast.error('Failed to load products for restocking'));
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId) return toast.error('Please select a product');
    
    setIsSubmitting(true);
    try {
      const payload = {
        quantity: Number(formData.quantity),
        reason: formData.reason
      };
      await api.patch(ENDPOINTS.INVENTORY.RESTOCK(formData.productId), payload);
      toast.success('Inventory restocked successfully!');
      setFormData({ productId: '', quantity: '', reason: 'New Supply' });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to restock inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restock Inventory" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-default">
        <div className="w-full">
          <label className="block text-sm font-medium text-chocolate mb-tiny">Select Product</label>
          <select 
            name="productId" 
            value={formData.productId} 
            onChange={handleChange} 
            className="w-full bg-white border border-gray-200 rounded px-default py-small text-slateGray focus:outline-none focus:ring-2 focus:ring-caramel"
            required
          >
            <option value="">Choose a product to restock...</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name} (Current Stock: {p.stockQuantity})</option>
            ))}
          </select>
        </div>
        <Input 
          label="Quantity to Add" 
          name="quantity" 
          type="number"
          min="1"
          value={formData.quantity} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Reason / Note" 
          name="reason" 
          value={formData.reason} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Weekly supply delivery"
        />

        <div className="flex justify-end gap-3 pt-section border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RestockModal;
