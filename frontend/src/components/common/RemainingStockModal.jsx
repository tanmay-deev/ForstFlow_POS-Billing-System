import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import Table from './Table.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const RemainingStockModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSearch('');
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.PRODUCTS);
      setProducts(res.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const columns = [
    { header: 'Product Name', accessor: 'name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-vanilla flex items-center justify-center shrink-0 overflow-hidden">
          {row.image ? (
            <img src={row.image} alt={row.name} className="w-full h-full object-cover mix-blend-multiply" />
          ) : (
            <Package size={16} className="text-chocolate/50" />
          )}
        </div>
        <span className="font-semibold text-chocolate">{row.name}</span>
      </div>
    )},
    { header: 'SKU', accessor: 'sku', render: (row) => row.sku || '-' },
    { header: 'Remaining Stock', accessor: 'stockQuantity', render: (row) => (
      <span className={`font-bold ${row.stockQuantity > 5 ? 'text-mint' : row.stockQuantity > 0 ? 'text-caramel' : 'text-softRed'}`}>
        {row.stockQuantity}
      </span>
    )}
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remaining Stock Overview" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-caramel"
          />
        </div>

        {/* Table */}
        <div className="border border-gray-100 rounded-lg overflow-hidden bg-white">
          <Table columns={columns} data={filteredProducts} keyField="_id" itemsPerPage={5} />
          
          {filteredProducts.length === 0 && !loading && (
             <div className="p-8 text-center text-slateGray flex flex-col items-center justify-center">
               <Package size={32} className="opacity-30 mb-2"/>
               No products found.
             </div>
          )}
          {loading && (
             <div className="p-8 text-center text-slateGray">Loading products...</div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RemainingStockModal;
