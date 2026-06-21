import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import Card from '../../components/common/Card.jsx';
import Loader from '../../components/common/Loader.jsx';
import { DollarSign, ShoppingBag, PackageX, Users } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DashboardHome = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, revRes, topRes] = await Promise.all([
          api.get(ENDPOINTS.DASHBOARD.SUMMARY),
          api.get(ENDPOINTS.DASHBOARD.REVENUE),
          api.get(ENDPOINTS.DASHBOARD.TOP_PRODUCTS)
        ]);
        
        setSummary(sumRes.data.data);
        
        const formattedRev = revRes.data.data.map(item => {
          // Parse "YYYY-MM-DD"
          const parts = item._id.split('-');
          // Month is 0-indexed in JS Date constructor
          const date = new Date(parts[0], parts[1] - 1, parts[2]);
          return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            total: item.revenue
          };
        });
        
        setRevenueData(formattedRev);
        setTopProducts(topRes.data.data);

      } catch (error) {
        console.error('Error fetching dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Loader text="Loading dashboard insights..." />;

  return (
    <div className="space-y-section animate-fade-in">
      <div>
        <h2 className="text-3xl font-heading font-bold text-chocolate">Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}!</h2>
        <p className="text-slateGray mt-1">Here's what's happening at your parlour today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-section">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-caramel/10 flex items-center justify-center text-caramel">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slateGray font-medium">Today's Revenue</p>
            <p className="text-2xl font-bold text-chocolate">₹{summary?.todayRevenue?.toFixed(2) || '0.00'}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-strawberry/10 flex items-center justify-center text-strawberry">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-slateGray font-medium">Orders Today</p>
            <p className="text-2xl font-bold text-chocolate">{summary?.todayOrders || 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-softRed/10 flex items-center justify-center text-softRed">
            <PackageX size={24} />
          </div>
          <div>
            <p className="text-sm text-slateGray font-medium">Low Stock Items</p>
            <p className="text-2xl font-bold text-chocolate">{summary?.lowStockCount || 0}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center text-mint">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slateGray font-medium">Total Customers</p>
            <p className="text-2xl font-bold text-chocolate">{summary?.totalCustomers || 0}</p>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-section">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-chocolate mb-section">Revenue Overview (7 Days)</h3>
          <div className="h-[300px] w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#4B2E2E', fontWeight: 'bold' }}
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#FB923C" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slateGray">
                No revenue data available for the last 7 days.
              </div>
            )}
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold text-chocolate mb-section">Top Selling Products</h3>
          <div className="h-[300px] w-full flex flex-col justify-center">
             <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-slateGray text-center">No sales data yet.</p>
                ) : (
                  topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-vanilla rounded flex items-center justify-center font-bold text-chocolate">#{i+1}</div>
                        <div>
                          <p className="font-medium text-chocolate truncate max-w-[120px]" title={p.name}>{p.name}</p>
                          <p className="text-xs text-slateGray">{p.totalSold} sales</p>
                        </div>
                      </div>
                      <span className="font-bold text-caramel">₹{p.revenue?.toFixed(2)}</span>
                    </div>
                  ))
                )}
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
