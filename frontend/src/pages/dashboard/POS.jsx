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
    setCart(prev => {
      const updated = prev.map(item => {
        if (item._id === id) {
          const newQty = item.quantity + delta;
          if (newQty > item.stockQuantity) {
            toast.error('Cannot exceed available stock');
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      });
      return updated.filter(item => item.quantity > 0);
    });
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
      <div className="flex-1 flex flex-col bg-white dark:bg-mocha dark:bg-espresso rounded-xl shadow-soft overflow-hidden min-h-[500px] lg:min-h-0 border border-transparent dark:border-cacao">
        {/* Search & Categories */}
        <div className="p-4 border-b border-gray-100 dark:border-cacao bg-white/80 dark:bg-espresso/80 backdrop-blur-md space-y-4 shrink-0 z-10 sticky top-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 dark:text-latte" size={20} />
            <input 
              type="text" 
              placeholder="Search by product name or code..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#2A1F1D] dark:bg-mocha border border-gray-200 dark:border-cacao rounded-lg focus:outline-none focus:ring-2 focus:ring-caramel focus:bg-white dark:bg-mocha dark:focus:bg-slate-900 text-sm font-medium transition-colors text-slateGray dark:text-latte placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === 'All' ? 'bg-chocolate dark:bg-caramel text-white shadow-md' : 'bg-white dark:bg-mocha text-slateGray dark:text-latte border border-gray-200 dark:border-cacao hover:border-caramel/50 dark:hover:border-caramel hover:text-chocolate dark:text-crema dark:hover:text-white'}`}
            >
              All Items
            </button>
            {categories.map(c => (
              <button 
                key={c._id}
                onClick={() => setSelectedCategory(c.name)}
                className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === c.name ? 'bg-chocolate dark:bg-caramel text-white shadow-md' : 'bg-white dark:bg-mocha text-slateGray dark:text-latte border border-gray-200 dark:border-cacao hover:border-caramel/50 dark:hover:border-caramel hover:text-chocolate dark:text-crema dark:hover:text-white'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-[#2A1F1D] dark:bg-espresso flex flex-col relative z-0">
          {filteredProducts.length === 0 ? (
            <EmptyState title="No products found" message="Try adjusting your search or category filter." icon={PackageX} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
              {filteredProducts.map(product => (
                <div 
                  key={product._id} 
                  onClick={() => addToCart(product)}
                  className={`bg-white dark:bg-mocha rounded-md shadow-sm border-2 transition-all flex flex-col overflow-hidden cursor-pointer select-none relative ${product.stockQuantity <= 0 ? 'border-gray-200 dark:border-cacao opacity-60 cursor-not-allowed' : 'border-transparent hover:border-caramel hover:-translate-y-1 hover:shadow-md active:scale-[0.98]'}`}
                >
                  {product.stockQuantity > 0 && product.stockQuantity <= 10 && (
                    <div className="absolute top-1 right-1 bg-softRed/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm z-10 backdrop-blur-sm">
                      Only {product.stockQuantity}
                    </div>
                  )}
                  <div className="aspect-square bg-vanilla overflow-hidden flex items-center justify-center p-2 relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm transform group-hover:scale-105 transition-transform duration-300" draggable="false" />
                    ) : (
                      <span className="text-chocolate dark:text-crema/20 dark:text-crema/20 font-bold text-4xl">{product.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col bg-white dark:bg-mocha shrink-0 border-t border-gray-50 dark:border-cacao">
                    <h3 className="font-semibold text-chocolate dark:text-crema dark:text-latte text-xs truncate mb-1.5" title={product.name}>{product.name}</h3>
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-caramel font-bold text-sm truncate">₹{product.price.toFixed(2)}</div>
                      <div className="text-[9px] font-bold text-slateGray dark:text-latte bg-gray-100 dark:bg-cacao dark:bg-[#2A1F1D] px-1.5 py-0.5 rounded-sm shrink-0">Stock: {product.stockQuantity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Billing Cart */}
      <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-mocha dark:bg-espresso rounded-lg shadow-soft overflow-hidden shrink-0 border border-transparent dark:border-cacao">
        {/* Cart Top Actions */}
        <div className="p-4 bg-white dark:bg-mocha dark:bg-espresso border-b border-gray-100 dark:border-cacao flex flex-wrap gap-2 shrink-0">
           <div className="flex-1 min-w-[80px] bg-chocolate dark:bg-caramel text-white font-bold rounded-lg flex items-center justify-center py-2.5 shadow-sm text-sm uppercase tracking-wide">
             Order
           </div>
           <button onClick={() => setCustomerModalOpen(true)} className="flex-1 min-w-[90px] bg-gray-50 dark:bg-mocha hover:bg-vanilla dark:hover:bg-espresso text-chocolate dark:text-crema font-bold rounded-lg flex items-center justify-center py-2.5 border border-gray-200 dark:border-cacao text-sm transition-all active:scale-95">
             <UserPlus size={16} className="mr-2" /> Customer
           </button>
           <button onClick={() => setCart([])} disabled={cart.length === 0} className="w-12 bg-gray-50 dark:bg-[#2A1F1D] hover:bg-softRed dark:hover:bg-softRed/90 hover:text-white dark:hover:text-white hover:border-softRed text-slateGray dark:text-latte font-bold rounded-lg flex items-center justify-center py-2.5 border border-gray-200 dark:border-cacao transition-all disabled:opacity-50 disabled:hover:bg-gray-50 dark:disabled:hover:bg-[#2A1F1D] disabled:hover:text-slateGray dark:disabled:hover:text-latte disabled:hover:border-gray-200 dark:disabled:hover:border-cacao active:scale-95">
             <Trash2 size={18} />
           </button>
        </div>

        {/* Customer Selection */}
        <div className="px-4 py-2 border-b border-gray-100 dark:border-cacao bg-white dark:bg-mocha dark:bg-espresso flex gap-2 items-center">
          <div className="flex-1 relative">
            <User className="absolute left-3 top-2.5 text-gray-400 dark:text-latte" size={18} />
            <select 
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-cacao rounded-md focus:outline-none focus:ring-2 focus:ring-caramel appearance-none bg-white dark:bg-mocha text-chocolate dark:text-crema dark:text-latte text-sm"
            >
              <option value="">Walk-in Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.fullName || c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-[#2A1F1D] dark:bg-espresso">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slateGray dark:text-latte opacity-50">
              <ShoppingCart size={56} className="mb-4 text-gray-300 dark:text-latte" />
              <p className="font-medium text-lg">Cart is empty</p>
              <p className="text-sm mt-1">Tap products to add them</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex items-center bg-white dark:bg-mocha p-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-cacao/80 dark:border-cacao gap-3 hover:border-caramel/30 dark:hover:border-caramel/50 transition-colors">
                
                <div className="w-12 h-12 bg-vanilla rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-50 dark:border-cacao/50">
                  {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm p-1" />
                  ) : (
                     <span className="text-chocolate dark:text-crema/30 dark:text-crema/30 font-bold text-lg">{item.name.charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-bold text-chocolate dark:text-crema dark:text-latte text-sm truncate" title={item.name}>{item.name}</h4>
                  <p className="text-xs text-caramel font-semibold mt-0.5">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="font-bold text-chocolate dark:text-crema text-base text-right shrink-0">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                  
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#2A1F1D] dark:bg-espresso rounded-lg shrink-0 border border-gray-200 dark:border-cacao/60 dark:border-cacao p-0.5">
                    <button onClick={() => updateQuantity(item._id, -1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-mocha rounded-md text-slateGray dark:text-latte hover:text-chocolate dark:text-crema dark:hover:text-white hover:shadow-sm active:bg-gray-100 dark:bg-cacao dark:active:bg-slate-700 transition-all">
                      <Minus size={12} strokeWidth={3} />
                    </button>
                    <span className="font-bold w-6 text-center text-xs text-chocolate dark:text-crema">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="w-6 h-6 flex items-center justify-center bg-white dark:bg-mocha rounded-md text-slateGray dark:text-latte hover:text-chocolate dark:text-crema dark:hover:text-white hover:shadow-sm active:bg-gray-100 dark:bg-cacao dark:active:bg-slate-700 transition-all">
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Offer Code */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-cacao bg-white dark:bg-mocha dark:bg-espresso flex gap-2 w-full box-border shrink-0">
          <input 
            type="text"
            placeholder="Enter Offer Code" 
            value={offerCode}
            onChange={e => setOfferCode(e.target.value.toUpperCase())}
            disabled={appliedOffer}
            className="flex-1 min-w-0 w-full bg-white dark:bg-mocha text-chocolate dark:text-crema border border-gray-200 dark:border-cacao rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-caramel disabled:bg-gray-100 dark:disabled:bg-cacao disabled:text-gray-500 dark:disabled:text-latte uppercase font-semibold"
          />
          {!appliedOffer ? (
            <Button onClick={handleApplyOffer} variant="outline" className="shrink-0 py-1.5 h-auto dark:border-cacao dark:text-latte dark:hover:bg-slate-800" size="small">Apply</Button>
          ) : (
            <Button onClick={() => { setAppliedOffer(null); setOfferCode(''); }} variant="outline" className="shrink-0 text-softRed border-softRed hover:bg-softRed/10 hover:text-red-700 py-1.5 h-auto" size="small">Remove</Button>
          )}
        </div>

        {/* Billing Summary */}
        <div className="p-4 border-t border-gray-100 dark:border-cacao bg-white dark:bg-mocha dark:bg-espresso space-y-1.5 shrink-0">
          <div className="flex justify-between text-slateGray dark:text-latte text-sm">
            <span>Subtotal</span>
            <span className="font-medium text-chocolate dark:text-crema dark:text-latte">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slateGray dark:text-latte text-sm">
            <span>Tax ({taxRate}%)</span>
            <span className="font-medium text-chocolate dark:text-crema dark:text-latte">₹{tax.toFixed(2)}</span>
          </div>
          {appliedOffer && (
            <div className="flex justify-between text-slateGray dark:text-latte text-sm">
              <span className="flex items-center gap-1">Discount ({appliedOffer.code})</span>
              <span className="font-medium text-chocolate dark:text-crema dark:text-latte">-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-chocolate dark:text-crema font-bold text-lg pt-1 mt-1">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition-all ${paymentMethod === 'cash' ? 'bg-chocolate dark:bg-caramel text-white shadow-md border-transparent ring-2 ring-chocolate/20 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-mocha text-slateGray dark:text-latte border border-gray-200 dark:border-cacao hover:bg-gray-50 dark:bg-[#2A1F1D] dark:hover:bg-slate-700'}`}
              >
                <Banknote size={16} className={paymentMethod === 'cash' ? 'text-caramel dark:text-crema' : 'text-gray-400'} /> 
                <span>Cash</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`py-2 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition-all ${paymentMethod === 'card' ? 'bg-chocolate dark:bg-caramel text-white shadow-md border-transparent ring-2 ring-chocolate/20 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-mocha text-slateGray dark:text-latte border border-gray-200 dark:border-cacao hover:bg-gray-50 dark:bg-[#2A1F1D] dark:hover:bg-slate-700'}`}
              >
                <CreditCard size={16} className={paymentMethod === 'card' ? 'text-caramel dark:text-crema' : 'text-gray-400'} /> 
                <span>Card</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 rounded-lg text-sm font-bold flex flex-col items-center gap-1 transition-all ${paymentMethod === 'upi' ? 'bg-chocolate dark:bg-caramel text-white shadow-md border-transparent ring-2 ring-chocolate/20 ring-offset-1 dark:ring-offset-slate-900' : 'bg-white dark:bg-mocha text-slateGray dark:text-latte border border-gray-200 dark:border-cacao hover:bg-gray-50 dark:bg-[#2A1F1D] dark:hover:bg-slate-700'}`}
              >
                <Smartphone size={16} className={paymentMethod === 'upi' ? 'text-caramel dark:text-crema' : 'text-gray-400'} /> 
                <span>UPI</span>
              </button>
            </div>
            <button 
              className="w-full mt-1 py-3 bg-caramel text-white rounded-xl font-bold text-lg shadow-lg hover:opacity-90 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 disabled:hover:opacity-100 flex items-center justify-center gap-2 border-b-4 border-black/10"
              onClick={handleCheckout} 
              disabled={cart.length === 0 || isProcessing}
            >
              {isProcessing ? <Loader size={20} color="border-white dark:border-cacao" /> : <ShoppingCart size={20} />}
              {isProcessing ? 'PROCESSING...' : `CHARGE ₹${total.toFixed(2)}`}
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
