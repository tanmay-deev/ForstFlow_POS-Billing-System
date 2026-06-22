import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import Button from '../../components/common/Button.jsx';
import OfferModal from '../../components/common/OfferModal.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';
import { Tag, Search, Power, Trash2 } from 'lucide-react';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOffers = async () => {
    try {
      const res = await api.get(ENDPOINTS.OFFERS);
      setOffers(res.data.data);
    } catch (error) {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleStatus = async (offer) => {
    try {
      await api.put(`${ENDPOINTS.OFFERS}/${offer._id}`, { isActive: !offer.isActive });
      toast.success(`Offer ${offer.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchOffers();
    } catch (error) {
      toast.error('Failed to update offer status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this offer?')) return;
    try {
      await api.delete(`${ENDPOINTS.OFFERS}/${id}`);
      toast.success('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      toast.error('Failed to delete offer');
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (row) => <span className="font-semibold text-chocolate dark:text-crema">{row.title}</span> },
    { header: 'Offer Code', accessor: 'code', render: (row) => <span className="font-bold text-caramel">{row.code}</span> },
    { header: 'Discount Type', accessor: 'discountType', render: (row) => <span className="capitalize">{row.discountType}</span> },
    { header: 'Value', accessor: 'discountValue', render: (row) => row.discountType === 'percentage' ? `${row.discountValue}%` : `₹${row.discountValue}` },
    { header: 'Valid Until', accessor: 'endDate', render: (row) => new Date(row.endDate).toLocaleDateString() },
    { header: 'Status', accessor: 'isActive', render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isActive ? 'bg-mint/10 text-mint' : 'bg-softRed/10 text-softRed'}`}>
        {row.isActive ? 'Active' : 'Deactivated'}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex gap-2">
        <button 
          onClick={() => handleToggleStatus(row)}
          className={`p-1 transition-colors ${row.isActive ? 'text-softRed hover:text-red-700' : 'text-mint hover:text-green-600'}`}
          title={row.isActive ? 'Deactivate Offer' : 'Activate Offer'}
        >
          <Power size={18} />
        </button>
        <button 
          onClick={() => handleDelete(row._id)}
          className="text-slateGray dark:text-latte hover:text-red-700 p-1 transition-colors"
          title="Delete Offer"
        >
          <Trash2 size={18} />
        </button>
      </div>
    )}
  ];

  if (loading) return <Loader text="Loading active offers..." />;

  const filteredOffers = offers.filter(o => 
    (o.code || o.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-section animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-chocolate dark:text-crema">Discount & Offers</h2>
          <p className="text-slateGray dark:text-latte">Create promotional codes and seasonal discounts.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-cacao rounded-md focus:outline-none focus:ring-2 focus:ring-caramel text-sm"
            />
          </div>
          <Button className="flex-1 sm:flex-none flex justify-center items-center gap-2 shrink-0" onClick={() => setIsModalOpen(true)}>
            <Tag size={18} /> Create Offer
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={filteredOffers} keyField="_id" />
      </Card>

      <OfferModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchOffers}
      />
    </div>
  );
};

export default Offers;
