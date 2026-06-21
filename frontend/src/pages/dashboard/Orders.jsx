import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import InvoiceModal from '../../components/common/InvoiceModal.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';
import { Download, CheckCircle, Search } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`${ENDPOINTS.ORDERS}?limit=1000`);
        setOrders(res.data.data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleComplete = async (order) => {
    try {
      await api.patch(`${ENDPOINTS.ORDERS}/${order._id}/status`, { status: 'completed' });
      toast.success('Order completed successfully!');
      
      const res = await api.get(`${ENDPOINTS.ORDERS}?limit=1000`);
      setOrders(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-mint/10 text-mint';
      case 'pending': return 'bg-caramel/10 text-caramel';
      case 'cancelled': return 'bg-softRed/10 text-softRed';
      default: return 'bg-gray-100 text-slateGray';
    }
  };

  const columns = [
    { header: 'Order ID', accessor: '_id', render: (row) => <span className="font-mono text-xs">{row.orderNumber || row._id.slice(-8).toUpperCase()}</span> },
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleString() },
    { header: 'Customer', accessor: 'customerId', render: (row) => row.customerId?.fullName || row.customer?.name || 'Walk-in Customer' },
    { header: 'Total Amount', accessor: 'totalAmount', render: (row) => <span className="font-bold text-chocolate">₹{row.totalAmount.toFixed(2)}</span> },
    { header: 'Payment Method', accessor: 'paymentMethod', render: (row) => <span className="capitalize text-slateGray">{row.paymentMethod}</span> },
    { header: 'Status', accessor: 'orderStatus', render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(row.orderStatus)}`}>
        {row.orderStatus}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex items-center gap-2">
        {row.orderStatus === 'pending' && (
          <button 
            onClick={() => handleComplete(row)}
            className="text-mint hover:text-green-600 transition-colors p-1"
            title="Mark as Completed"
          >
            <CheckCircle size={18} />
          </button>
        )}
        <button 
          onClick={() => setSelectedOrder(row)}
          className="text-caramel hover:text-chocolate transition-colors p-1"
          title="Download Invoice"
        >
          <Download size={18} />
        </button>
      </div>
    )}
  ];

  if (loading) return <Loader text="Loading recent orders..." />;

  const filteredOrders = orders.filter(o => {
    const searchLower = searchTerm.toLowerCase();
    const orderIdMatch = (o.orderNumber || o._id).toLowerCase().includes(searchLower);
    const customerMatch = (o.customerId?.fullName || o.customer?.name || 'walk-in customer').toLowerCase().includes(searchLower);
    return orderIdMatch || customerMatch;
  });

  const handleClearOrders = async () => {
    if (!window.confirm('Are you sure you want to delete ALL orders? This is for testing only.')) return;
    try {
      await api.delete(ENDPOINTS.ORDERS);
      toast.success('All orders deleted successfully');
      // Re-fetch orders after deletion
      const res = await api.get(`${ENDPOINTS.ORDERS}?limit=1000`);
      setOrders(res.data.data);
    } catch (error) {
      toast.error('Failed to delete orders');
    }
  };

  return (
    <div className="space-y-section animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-chocolate">Order History</h2>
          <p className="text-slateGray">View and manage customer transactions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={handleClearOrders}
            className="px-4 py-2 border border-gray-200 text-slateGray rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Clear Orders
          </button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-caramel text-sm"
            />
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={filteredOrders} keyField="_id" />
      </Card>

      <InvoiceModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        order={selectedOrder} 
      />
    </div>
  );
};

export default Orders;
