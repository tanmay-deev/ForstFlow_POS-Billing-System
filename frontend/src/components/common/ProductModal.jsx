import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, categories, onSuccess, editingProduct = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stockQuantity: '',
    isAvailable: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingProduct && isOpen) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        categoryId: editingProduct.categoryId?._id || editingProduct.categoryId || '',
        stockQuantity: editingProduct.stockQuantity || 0,
        isAvailable: editingProduct.isAvailable !== false
      });
      setImagePreview(editingProduct.image || null);
    } else if (isOpen) {
      setFormData({ name: '', description: '', price: '', categoryId: '', stockQuantity: '', isAvailable: true });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingProduct, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error('Please select a category');
    
    setIsSubmitting(true);
    try {
      let imageUrl = editingProduct ? editingProduct.image : null;
      
      // Upload image first if present
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadRes = await api.post(ENDPOINTS.UPLOAD, uploadData);
        imageUrl = uploadRes.data.data;
      }

      const productPayload = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        image: imageUrl
      };

      if (editingProduct) {
        await api.put(`${ENDPOINTS.PRODUCTS}/${editingProduct._id}`, productPayload);
        toast.success('Product updated successfully!');
      } else {
        await api.post(ENDPOINTS.PRODUCTS, productPayload);
        toast.success('Product created successfully!');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProduct ? "Edit Product" : "Add New Product"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-default">
          <Input 
            label="Product Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Vanilla Bean Cone"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-chocolate dark:text-crema mb-tiny">Category</label>
            <select 
              name="categoryId" 
              value={formData.categoryId} 
              onChange={handleChange} 
              className="w-full bg-white dark:bg-mocha border border-gray-200 dark:border-cacao rounded px-default py-small text-slateGray dark:text-latte focus:outline-none focus:ring-2 focus:ring-caramel"
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-chocolate dark:text-crema mb-tiny">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            rows="3"
            className="w-full bg-white dark:bg-mocha border border-gray-200 dark:border-cacao rounded px-default py-small text-slateGray dark:text-latte focus:outline-none focus:ring-2 focus:ring-caramel"
            placeholder="Product details..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-default">
          <Input 
            label="Price (₹)" 
            name="price" 
            type="number" 
            step="0.01"
            min="0"
            value={formData.price} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Initial Stock Quantity" 
            name="stockQuantity" 
            type="number" 
            min="0"
            value={formData.stockQuantity} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-chocolate dark:text-crema mb-tiny">Product Image</label>
          <div className="border-2 border-dashed border-gray-200 dark:border-cacao rounded-lg p-6 flex flex-col items-center justify-center text-center">
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded" />
                <button 
                  type="button" 
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-white dark:bg-mocha text-softRed rounded-full shadow-soft hover:bg-vanilla dark:bg-espresso"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-slateGray dark:text-latte mb-4">Upload a high-quality product image (Max 5MB)</p>
                <Button type="button" variant="outline" size="small" onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="isAvailable" 
            name="isAvailable" 
            checked={formData.isAvailable} 
            onChange={handleChange}
            className="w-4 h-4 text-caramel rounded focus:ring-caramel"
          />
          <label htmlFor="isAvailable" className="text-sm font-medium text-chocolate dark:text-crema">Active & Available for Sale</label>
        </div>

        <div className="flex justify-end gap-3 pt-section border-t border-gray-100 dark:border-cacao">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
