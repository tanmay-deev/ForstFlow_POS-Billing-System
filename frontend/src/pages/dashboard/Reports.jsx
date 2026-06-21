import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import { FileBarChart, Download, ArrowLeft, Calendar } from 'lucide-react';
import api from '../../api/axios.js';
import { ENDPOINTS } from '../../api/endpoints.js';
import { exportToCSV } from '../../utils/csvExport.js';
import toast from 'react-hot-toast';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(null); // 'sales' or 'inventory'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  // Date filters for sales report
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Default to last 7 days
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ENDPOINTS.REPORTS.SALES}?startDate=${startDate}&endDate=${endDate}`);
      // Flatten the order data for CSV
      const flattenedData = res.data.data.map(order => ({
        OrderID: order.orderNumber,
        Date: new Date(order.createdAt).toLocaleDateString(),
        Time: new Date(order.createdAt).toLocaleTimeString(),
        Cashier: order.cashierId?.fullName || 'Unknown',
        PaymentMethod: order.paymentMethod,
        Subtotal: order.subtotal,
        Tax: order.taxAmount,
        Discount: order.discountAmount,
        Total: order.totalAmount,
        Items: order.items.map(i => `${i.quantity}x ${i.name}`).join('; ')
      }));
      setData(flattenedData);
    } catch (error) {
      toast.error('Failed to fetch sales report');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${ENDPOINTS.REPORTS.INVENTORY}?limit=5000`);
      const flattenedData = res.data.data.map(log => ({
        Date: new Date(log.createdAt).toLocaleDateString(),
        Time: new Date(log.createdAt).toLocaleTimeString(),
        Action: log.actionType,
        Product: log.productId?.name || 'Unknown',
        QuantityChange: log.quantity,
        PreviousStock: log.previousStock,
        NewStock: log.newStock,
        PerformedBy: log.performedBy?.fullName || 'System',
        Reason: log.reason || ''
      }));
      setData(flattenedData);
    } catch (error) {
      toast.error('Failed to fetch inventory report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'inventory') {
      fetchInventoryReport();
    }
  }, [activeTab]); // Fetch when tab changes

  const handleExport = () => {
    if (!data.length) {
      toast.error('No data to export');
      return;
    }
    const filename = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(data, filename);
    toast.success('Report exported successfully!');
  };

  if (activeTab) {
    return (
      <div className="space-y-section animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab(null)}
              className="p-2 hover:bg-vanilla text-slateGray rounded-full transition-colors shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-heading font-bold text-chocolate capitalize">
                {activeTab} Report
              </h2>
              <p className="text-slateGray">Detailed analysis and export options.</p>
            </div>
          </div>
          <Button variant="primary" icon={Download} onClick={handleExport} disabled={!data.length || loading} className="w-full sm:w-auto flex justify-center">
            Export CSV
          </Button>
        </div>

        {activeTab === 'sales' && (
          <Card className="flex flex-col sm:flex-row gap-4 items-end p-default bg-vanilla/50">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slateGray mb-1">Start Date</label>
              <Input 
                type="date" 
                icon={Calendar} 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slateGray mb-1">End Date</label>
              <Input 
                type="date" 
                icon={Calendar} 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
            <Button variant="outline" onClick={fetchSalesReport} className="w-full sm:w-auto h-[42px]">
              Apply Filter
            </Button>
          </Card>
        )}

        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-12"><Loader /></div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-slateGray">No data found for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-vanilla border-b border-gray-100">
                    {Object.keys(data[0]).map(header => (
                      <th key={header} className="p-4 text-sm font-semibold text-chocolate whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      {Object.values(row).map((val, cellIdx) => (
                        <td key={cellIdx} className="p-4 text-sm text-slateGray whitespace-nowrap max-w-[200px] truncate">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-section animate-fade-in">
      <div>
        <h2 className="text-2xl font-heading font-bold text-chocolate">Advanced Analytics</h2>
        <p className="text-slateGray">Generate detailed reports for your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-section">
        <Card 
          onClick={() => setActiveTab('sales')}
          className="flex flex-col items-center justify-center text-center p-12 hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-caramel"
        >
          <div className="w-16 h-16 bg-vanilla rounded-full flex items-center justify-center text-caramel mb-4">
            <FileBarChart size={32} />
          </div>
          <h3 className="text-xl font-bold text-chocolate">Sales Report</h3>
          <p className="text-slateGray mt-2">Export detailed daily, weekly, or monthly revenue reports to CSV.</p>
        </Card>
        
        <Card 
          onClick={() => setActiveTab('inventory')}
          className="flex flex-col items-center justify-center text-center p-12 hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-strawberry"
        >
          <div className="w-16 h-16 bg-strawberry/10 rounded-full flex items-center justify-center text-strawberry mb-4">
            <FileBarChart size={32} />
          </div>
          <h3 className="text-xl font-bold text-chocolate">Inventory Report</h3>
          <p className="text-slateGray mt-2">Analyze stock movement, waste, and supply chain efficiency.</p>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
