import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import CustomerModal from '../../components/common/CustomerModal.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get(ENDPOINTS.CUSTOMERS);
      setCustomers(res.data.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`${ENDPOINTS.CUSTOMERS}/${id}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to delete customer');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => <span className="font-semibold text-chocolate">{row.fullName || row.name}</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Loyalty Points', accessor: 'loyaltyPoints', render: (row) => (
      <span className="font-bold text-caramel">{row.loyaltyPoints} pts</span>
    )},
    { header: 'Total Orders', accessor: 'totalOrders' },
    { header: 'Total Spent', accessor: 'totalSpent', render: (row) => `₹${row.totalSpent.toFixed(2)}` },
    { header: 'Joined', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex gap-2">
        <button 
          onClick={() => {
            setEditingCustomer(row);
            setIsModalOpen(true);
          }}
          className="text-caramel hover:text-chocolate p-1 transition-colors"
          title="Edit Customer"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={() => handleDelete(row._id)}
          className="text-softRed hover:text-red-700 p-1 transition-colors"
          title="Delete Customer"
        >
          <Trash2 size={18} />
        </button>
      </div>
    )}
  ];

  if (loading) return <Loader text="Loading customer data..." />;

  const filteredCustomers = customers.filter(c => 
    (c.fullName || c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-section animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-chocolate">Customer Directory</h2>
          <p className="text-slateGray">Manage loyalty programs and customer records.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-caramel text-sm"
            />
          </div>
          <Button className="flex-1 sm:flex-none flex justify-center items-center gap-2 shrink-0" onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}>
            <Plus size={18} /> Add Customer
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={filteredCustomers} keyField="_id" />
      </Card>

      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setEditingCustomer(null), 200);
        }} 
        onSuccess={fetchCustomers}
        editingCustomer={editingCustomer}
      />
    </div>
  );
};

export default Customers;
