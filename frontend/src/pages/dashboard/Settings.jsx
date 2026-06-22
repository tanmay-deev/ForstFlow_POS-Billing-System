import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';

const Settings = () => {
  const { settings, refreshSettings, loading } = useSettings();
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    contactNumber: '',
    email: '',
    gstNumber: '',
    gstPercentage: '',
    currency: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        businessName: settings.businessName || '',
        address: settings.address || '',
        contactNumber: settings.contactNumber || '',
        email: settings.email || '',
        gstNumber: settings.gstNumber || '',
        gstPercentage: settings.gstPercentage || 0,
        currency: settings.currency || ''
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(ENDPOINTS.SETTINGS, formData);
      await refreshSettings();
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading settings..." />;

  return (
    <div className="space-y-section animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold text-chocolate dark:text-crema">System Settings</h2>
        <p className="text-slateGray dark:text-latte">Configure global preferences for FrostFlow.</p>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-chocolate dark:text-crema mb-section border-b border-gray-100 dark:border-cacao pb-2">Parlour Configuration</h3>
        <div className="space-y-default max-w-2xl">
          <Input label="Store Name" name="businessName" value={formData.businessName} onChange={handleChange} />
          <Input label="Store Address" name="address" value={formData.address} onChange={handleChange} />
          <Input label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
          <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Input label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
          <Input label="Tax Rate (%)" name="gstPercentage" type="number" value={formData.gstPercentage} onChange={handleChange} />
          <div className="pt-section">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
