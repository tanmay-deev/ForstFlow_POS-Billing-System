import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import ProductModal from '../../components/common/ProductModal.jsx';
import CategoryModal from '../../components/common/CategoryModal.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import toast from 'react-hot-toast';
import { Plus, Tags, Edit, Trash2, Search } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(ENDPOINTS.PRODUCTS),
        api.get(ENDPOINTS.CATEGORIES)
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`${ENDPOINTS.PRODUCTS}/${id}`);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const columns = [
    { header: 'Image', accessor: 'image', render: (row) => (
      row.image ? <img src={row.image} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-vanilla flex items-center justify-center text-chocolate font-bold">{row.name.charAt(0)}</div>
    )},
    { header: 'Name', accessor: 'name', render: (row) => <span className="font-semibold text-chocolate">{row.name}</span> },
    { header: 'Category', accessor: 'categoryId', render: (row) => row.categoryId?.name || 'Uncategorized' },
    { header: 'Price', accessor: 'price', render: (row) => `₹${row.price.toFixed(2)}` },
    { header: 'Stock', accessor: 'stockQuantity' },
    { header: 'Status', accessor: 'isAvailable', render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isAvailable ? 'bg-mint/10 text-mint' : 'bg-softRed/10 text-softRed'}`}>
        {row.isAvailable ? 'Active' : 'Inactive'}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex gap-2">
        <button 
          onClick={() => {
            setEditingProduct(row);
            setProductModalOpen(true);
          }}
          className="text-caramel hover:text-chocolate p-1 transition-colors"
          title="Edit Product"
        >
          <Edit size={18} />
        </button>
        <button 
          onClick={() => handleDelete(row._id)}
          className="text-softRed hover:text-red-700 p-1 transition-colors"
          title="Delete Product"
        >
          <Trash2 size={18} />
        </button>
      </div>
    )}
  ];

  if (loading) return <Loader text="Loading products..." />;

  return (
    <div className="space-y-section animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-chocolate">Product Management</h2>
          <p className="text-slateGray">Manage your parlour's offerings.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none flex justify-center items-center gap-2" onClick={() => setCategoryModalOpen(true)}>
            <Tags size={18} /> Add Category
          </Button>
          <Button className="flex-1 sm:flex-none flex justify-center items-center gap-2" onClick={() => {
            setEditingProduct(null);
            setProductModalOpen(true);
          }}>
            <Plus size={18} /> Add Product
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-caramel text-sm"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table columns={columns} data={products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))} keyField="_id" />
      </Card>

      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => {
          setProductModalOpen(false);
          setTimeout(() => setEditingProduct(null), 200);
        }} 
        categories={categories}
        onSuccess={fetchData}
        editingProduct={editingProduct}
      />
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setCategoryModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Products;
