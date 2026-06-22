import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import RestockModal from '../../components/common/RestockModal.jsx';
import RemainingStockModal from '../../components/common/RemainingStockModal.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';
import { ArchiveRestore, PackageSearch } from 'lucide-react';

const Inventory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const fetchInventoryLogs = async () => {
    try {
      const res = await api.get(`${ENDPOINTS.INVENTORY.LOGS}?limit=1000`);
      setLogs(res.data.data);
    } catch (error) {
      toast.error('Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryLogs();
  }, []);

  const columns = [
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Product', accessor: 'productId', render: (row) => row.productId?.name || 'Unknown Product' },
    { header: 'Type', accessor: 'actionType', render: (row) => {
      const isAdd = row.actionType === 'stock_added' || row.actionType === 'stock_adjusted';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAdd ? 'bg-mint/10 text-mint' : 'bg-softRed/10 text-softRed'}`}>
          {isAdd ? 'ADD' : 'REMOVE'}
        </span>
      );
    }},
    { header: 'Quantity', accessor: 'quantity', render: (row) => {
      const isAdd = row.actionType === 'stock_added' || row.actionType === 'stock_adjusted';
      return (
        <span className={`font-bold ${isAdd ? 'text-mint' : 'text-softRed'}`}>
          {isAdd ? '+' : '-'}{Math.abs(row.quantity)}
        </span>
      );
    }},
    { header: 'Reason', accessor: 'reason' },
    { header: 'User', accessor: 'performedBy', render: (row) => row.performedBy?.fullName || 'System' }
  ];

  if (loading) return <Loader text="Loading inventory records..." />;

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to delete ALL inventory logs? This is for testing only.')) return;
    try {
      await api.delete(ENDPOINTS.INVENTORY.LOGS);
      toast.success('All inventory logs deleted successfully');
      fetchInventoryLogs();
    } catch (error) {
      toast.error('Failed to delete inventory logs');
    }
  };

  return (
    <div className="space-y-section animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-chocolate dark:text-crema">Inventory Logs</h2>
          <p className="text-slateGray dark:text-latte">Track all stock additions and deductions.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none flex justify-center items-center gap-2" onClick={handleClearLogs}>
            Clear Logs
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none flex justify-center items-center gap-2" onClick={() => setIsStockModalOpen(true)}>
            <PackageSearch size={18} /> Remaining Stock
          </Button>
          <Button className="flex-1 sm:flex-none flex justify-center items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <ArchiveRestore size={18} /> Adjust Stock
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={logs} keyField="_id" />
      </Card>

      <RestockModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchInventoryLogs}
      />
      <RemainingStockModal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
      />
    </div>
  );
};

export default Inventory;
