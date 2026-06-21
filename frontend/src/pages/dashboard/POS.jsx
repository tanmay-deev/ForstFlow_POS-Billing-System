import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader, { EmptyState } from '../../components/common/Loader.jsx';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, PackageX, Tag, UserPlus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomerModal from '../../components/common/CustomerModal.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const POS = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const [offerCode, setOfferCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(ENDPOINTS.CUSTOMERS);
      setCustomers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch customers');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, custRes] = await Promise.all([
          api.get(ENDPOINTS.PRODUCTS),
          api.get(ENDPOINTS.CATEGORIES),
          api.get(ENDPOINTS.CUSTOMERS)
        ]);
        setProducts(prodRes.data.data.filter(p => p.isAvailable));
        setCategories(catRes.data.data.filter(c => c.isActive));
        setCustomers(custRes.data.data);
      } catch (error) {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.categoryId?.name === selectedCategory || p.category?.name === selectedCategory || p.categoryId === selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      toast.error('Product is out of stock!');
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.error('Cannot add more than available stock');
          return prev;
        }
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.stockQuantity) {
          toast.error('Cannot exceed available stock');
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedOffer) {
    if (appliedOffer.discountType === 'percentage') {
      discountAmount = (subtotal * appliedOffer.discountValue) / 100;
    } else {
      discountAmount = appliedOffer.discountValue;
    }
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  const taxRate = settings?.gstPercentage || 5;
  const tax = (subtotal - discountAmount) * (taxRate / 100);
  const total = subtotal - discountAmount + tax;

  const handleApplyOffer = async () => {
    if (!offerCode.trim()) return toast.error('Please enter an offer code');
    try {
      const res = await api.get('/offers'); // ENDPOINTS.OFFERS or direct path
      const offers = res.data.data;
      const validOffer = offers.find(o => o.code.toLowerCase() === offerCode.toLowerCase() && new Date(o.endDate) > new Date() && o.isActive);
      
      if (!validOffer) {
        return toast.error('Invalid or expired offer code');
      }
      if (validOffer.minimumPurchase && subtotal < validOffer.minimumPurchase) {
        return toast.error(`Minimum purchase of ₹${validOffer.minimumPurchase} required`);
      }
      
      setAppliedOffer(validOffer);
      toast.success('Offer applied successfully!');
    } catch (error) {
      toast.error('Failed to validate offer');
    }
  };

  useEffect(() => {
    // If cart changes, re-validate minimum purchase requirement
    if (appliedOffer && appliedOffer.minimumPurchase && subtotal < appliedOffer.minimumPurchase) {
      setAppliedOffer(null);
      setOfferCode('');
      toast.error(`Offer removed. Minimum purchase of ₹${appliedOffer.minimumPurchase} required.`);
    }
  }, [subtotal, appliedOffer]);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    
    setIsProcessing(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        customerId: selectedCustomerId || undefined,
        paymentMethod,
        totalAmount: total,
        taxAmount: tax,
        subtotal: subtotal,
        discountAmount: discountAmount
      };

      await api.post(ENDPOINTS.ORDERS, orderData);
      toast.success('Order completed successfully!');
      setCart([]);
      setAppliedOffer(null);
      setOfferCode('');
      setSelectedCustomerId('');
      
      // Refresh products to update stock
      const prodRes = await api.get(ENDPOINTS.PRODUCTS);
      setProducts(prodRes.data.data.filter(p => p.isAvailable));
      
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <Loader text="Loading POS System..." />;

  return (
    <div className="flex flex-col lg:flex-row gap-section h-auto lg:h-[calc(100vh-8rem)]">
      
      {/* Left Side: Product Selection */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-soft overflow-hidden min-h-[500px] lg:min-h-0">
        {/* Search & Categories */}
        <div className="p-section border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-caramel"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-chocolate mb-3">Category</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`whitespace-nowrap px-6 py-2 rounded-xl border-2 text-sm font-semibold transition-colors flex items-center gap-2 ${selectedCategory === 'All' ? 'border-caramel text-caramel bg-caramel/5' : 'border-gray-200 text-slateGray hover:border-caramel/50'}`}
              >
                All Items
              </button>
              {categories.map(c => (
                <button 
                  key={c._id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`whitespace-nowrap px-6 py-2 rounded-xl border-2 text-sm font-semibold transition-colors flex items-center gap-2 ${selectedCategory === c.name ? 'border-caramel text-caramel bg-caramel/5' : 'border-gray-200 text-slateGray hover:border-caramel/50'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-section overflow-y-auto bg-gray-50 flex flex-col">
          <h3 className="text-lg font-bold text-chocolate mb-4 shrink-0">Product</h3>
          {filteredProducts.length === 0 ? (
            <EmptyState title="No products found" message="Try adjusting your search or category filter." icon={PackageX} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product._id} 
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all flex flex-col overflow-hidden ${product.stockQuantity <= 0 ? 'border-gray-200 opacity-60' : 'border-transparent hover:border-caramel hover:shadow-medium'}`}
                >
                  <div className="aspect-square bg-vanilla overflow-hidden flex items-center justify-center p-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <span className="text-chocolate/30 font-bold text-4xl">{product.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 text-center">
                    <h3 className="font-semibold text-chocolate text-sm line-clamp-2 min-h-[40px] leading-tight mb-1" title={product.name}>{product.name}</h3>
                    <div className="text-chocolate font-bold text-sm mb-3">₹{product.price.toFixed(2)}</div>
                    <div className="mt-auto">
                      <button 
                        onClick={() => addToCart(product)}
                        disabled={product.stockQuantity <= 0}
                        className="w-full py-2 bg-caramel text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-300"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Billing Cart */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-lg shadow-soft overflow-hidden shrink-0">
        {/* Cart Top Actions */}
        <div className="p-3 bg-white border-b border-gray-100 flex flex-wrap gap-2">
           <div className="flex-1 min-w-[80px] bg-caramel text-white font-bold rounded-lg flex items-center justify-center py-2 shadow-sm border border-caramel text-xs sm:text-sm">
             Order
           </div>
           <button onClick={() => setCustomerModalOpen(true)} className="flex-1 min-w-[100px] bg-white hover:bg-vanilla text-slateGray font-medium rounded-lg flex items-center justify-center py-2 shadow-sm border border-gray-200 text-xs sm:text-sm transition-colors">
             + Customer
           </button>
           <button onClick={() => setCart([])} disabled={cart.length === 0} className="flex-1 min-w-[80px] bg-white hover:bg-softRed/10 text-slateGray hover:text-softRed font-medium rounded-lg flex items-center justify-center py-2 shadow-sm border border-gray-200 text-xs sm:text-sm transition-colors disabled:opacity-50">
             Clear all
           </button>
        </div>

        {/* Customer Selection */}
        <div className="px-section py-3 border-b border-gray-100 bg-white flex gap-2 items-center">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-caramel appearance-none bg-white text-sm"
            >
              <option value="">Walk-in Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.fullName || c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-section space-y-3 bg-vanilla/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slateGray opacity-50">
              <ShoppingCart size={48} className="mb-4" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex flex-col sm:flex-row sm:items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 gap-3">
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-vanilla rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image ? (
                       <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                       <span className="text-chocolate/30 font-bold">{item.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-chocolate text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-slateGray">₹{item.price.toFixed(2)}</p>
                  </div>
                  {/* Mobile delete button */}
                  <button onClick={() => removeFromCart(item._id)} className="sm:hidden text-gray-400 hover:text-softRed transition-colors p-1 shrink-0">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between sm:justify-end shrink-0 gap-3 pl-15 sm:pl-0">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-1 shrink-0">
                    <button onClick={() => updateQuantity(item._id, -1)} className="w-7 h-7 flex items-center justify-center text-slateGray hover:text-chocolate font-bold">
                      <Minus size={14} />
                    </button>
                    <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="w-7 h-7 flex items-center justify-center text-slateGray hover:text-chocolate font-bold">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="font-bold text-chocolate text-sm text-right shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    {/* Desktop delete button */}
                    <button onClick={() => removeFromCart(item._id)} className="hidden sm:block text-gray-400 hover:text-softRed transition-colors shrink-0">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Offer Code */}
        <div className="px-section py-3 border-t border-gray-100 bg-white flex gap-2 w-full box-border">
          <input 
            type="text"
            placeholder="Enter Offer Code" 
            value={offerCode}
            onChange={e => setOfferCode(e.target.value.toUpperCase())}
            disabled={appliedOffer}
            className="flex-1 min-w-0 w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-caramel disabled:bg-gray-100 disabled:text-gray-500 uppercase font-semibold"
          />
          {!appliedOffer ? (
            <Button onClick={handleApplyOffer} variant="outline" className="shrink-0" size="small">Apply</Button>
          ) : (
            <Button onClick={() => { setAppliedOffer(null); setOfferCode(''); }} variant="outline" className="shrink-0 text-softRed border-softRed hover:bg-softRed/10 hover:text-red-700" size="small">Remove</Button>
          )}
        </div>

        {/* Billing Summary */}
        <div className="p-section border-t border-gray-100 bg-white space-y-2">
          <div className="flex justify-between text-slateGray text-sm">
            <span>Subtotal</span>
            <span className="font-medium text-chocolate">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slateGray text-sm">
            <span>Tax ({taxRate}%)</span>
            <span className="font-medium text-chocolate">₹{tax.toFixed(2)}</span>
          </div>
          {appliedOffer && (
            <div className="flex justify-between text-slateGray text-sm">
              <span className="flex items-center gap-1">Discount ({appliedOffer.code})</span>
              <span className="font-medium text-chocolate">-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-chocolate font-bold text-lg pt-2 mt-2">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <div className="pt-4 space-y-3">
            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold flex justify-center items-center transition-colors ${paymentMethod === 'cash' ? 'bg-caramel text-white shadow-soft border border-caramel' : 'bg-white text-slateGray border border-gray-200 hover:bg-vanilla'}`}
              >
                Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold flex justify-center items-center transition-colors ${paymentMethod === 'card' ? 'bg-caramel text-white shadow-soft border border-caramel' : 'bg-white text-slateGray border border-gray-200 hover:bg-vanilla'}`}
              >
                Debit
              </button>
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold flex justify-center items-center transition-colors ${paymentMethod === 'upi' ? 'bg-caramel text-white shadow-soft border border-caramel' : 'bg-white text-slateGray border border-gray-200 hover:bg-vanilla'}`}
              >
                UPI
              </button>
            </div>
            <button 
              className="w-full mt-2 py-4 text-chocolate bg-white border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-caramel hover:text-caramel transition-colors disabled:opacity-50"
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      <CustomerModal 
        isOpen={customerModalOpen} 
        onClose={() => setCustomerModalOpen(false)} 
        onSuccess={fetchCustomers}
      />
    </div>
  );
};

export default POS;
