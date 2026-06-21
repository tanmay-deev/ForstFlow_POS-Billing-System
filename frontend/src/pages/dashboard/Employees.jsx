import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import EmployeeModal from '../../components/common/EmployeeModal.jsx';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import { UserPlus, Edit, Trash2, Search } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/auth/users');
      setEmployees(res.data.data);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this employee?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('Employee suspended successfully');
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to suspend employee');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'fullName', render: (row) => <span className="font-semibold text-chocolate">{row.fullName}</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', render: (row) => (
      <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-vanilla text-chocolate border border-caramel/20">
        {row.role}
      </span>
    )},
    { header: 'Phone', accessor: 'phone' },
    { header: 'Status', accessor: 'isActive', render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isActive ? 'bg-mint/10 text-mint' : 'bg-softRed/10 text-softRed'}`}>
        {row.isActive ? 'Active' : 'Suspended'}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex gap-2">
        <button 
          onClick={() => {
            setEditingEmployee(row);
            setIsModalOpen(true);
          }}
          className="text-caramel hover:text-chocolate p-1 transition-colors"
          title="Edit Employee"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={() => handleDelete(row._id)}
          className="text-softRed hover:text-red-700 p-1 transition-colors"
          title="Suspend Employee"
        >
          <Trash2 size={18} />
        </button>
      </div>
    )}
  ];

  if (loading) return <Loader text="Loading employee records..." />;

  const filteredEmployees = employees.filter(e => 
    (e.fullName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-section animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-chocolate">Staff Management</h2>
          <p className="text-slateGray">Manage employees and their system access roles.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-caramel text-sm"
            />
          </div>
          <Button className="flex-1 sm:flex-none flex justify-center items-center gap-2 shrink-0" onClick={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}>
            <UserPlus size={18} /> Add Employee
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={filteredEmployees} keyField="_id" />
      </Card>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setEditingEmployee(null), 200);
        }} 
        onSuccess={fetchEmployees}
        editingEmployee={editingEmployee}
      />
    </div>
  );
};

export default Employees;
