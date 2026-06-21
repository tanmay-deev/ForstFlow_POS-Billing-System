import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Input from './Input.jsx';
import Button from './Button.jsx';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

const EmployeeModal = ({ isOpen, onClose, onSuccess, editingEmployee = null }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEmployee && isOpen) {
      setFormData({
        fullName: editingEmployee.fullName || '',
        email: editingEmployee.email || '',
        password: '', // Leave blank unless they want to change it
        phone: editingEmployee.phone || '',
        role: editingEmployee.role || 'staff'
      });
    } else if (isOpen) {
      setFormData({ fullName: '', email: '', password: '', phone: '', role: 'staff' });
    }
  }, [editingEmployee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingEmployee && !payload.password) {
        delete payload.password;
      }

      if (editingEmployee) {
        await api.put(`/auth/users/${editingEmployee._id}`, payload);
        toast.success('Employee updated successfully!');
      } else {
        await api.post('/auth/register', payload);
        toast.success('Employee registered successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to save employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingEmployee ? "Edit Employee" : "Register New Employee"} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-default">
        <Input 
          label="Full Name" 
          name="fullName" 
          value={formData.fullName} 
          onChange={handleChange} 
          required 
          placeholder="e.g. Jane Smith"
        />
        <Input 
          label="Email Address" 
          name="email" 
          type="email"
          value={formData.email} 
          onChange={handleChange} 
          required
        />
        <Input 
          label={editingEmployee ? "New Password (Optional)" : "Password"} 
          name="password" 
          type="password"
          value={formData.password} 
          onChange={handleChange} 
          required={!editingEmployee}
        />
        <Input 
          label="Phone Number" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          required
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-chocolate mb-tiny">Role</label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            className="w-full bg-white border border-gray-200 rounded px-default py-small text-slateGray focus:outline-none focus:ring-2 focus:ring-caramel"
            required
          >
            <option value="staff">Staff</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="admin">System Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-section border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
