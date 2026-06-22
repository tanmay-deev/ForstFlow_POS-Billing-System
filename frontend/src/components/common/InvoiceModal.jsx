import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { Download } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const { settings } = useSettings();

  if (!order) return null;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Invoice_${order.orderNumber}`;
    window.print();
    // Keep title changed long enough for print dialog
    setTimeout(() => { document.title = originalTitle; }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice" maxWidth="max-w-2xl">
      <div id="invoice-content" className="p-4 bg-white dark:bg-mocha">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-chocolate dark:text-crema mb-2">{settings?.businessName || 'FrostFlow'}</h1>
            <p className="text-slateGray dark:text-latte whitespace-pre-wrap">{settings?.address || '123 Ice Cream Lane, Sweet City'}</p>
            {settings?.contactNumber && <p className="text-slateGray dark:text-latte mt-1">Phone: {settings.contactNumber}</p>}
            {settings?.email && <p className="text-slateGray dark:text-latte">Email: {settings.email}</p>}
            {settings?.gstNumber && <p className="text-slateGray dark:text-latte mt-1 font-bold">GSTIN: {settings.gstNumber}</p>}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-caramel mb-2">INVOICE</h2>
            <p className="text-sm font-medium text-slateGray dark:text-latte">Order #: {order.orderNumber}</p>
            <p className="text-sm text-slateGray dark:text-latte">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-sm text-slateGray dark:text-latte">Status: <span className="uppercase">{order.paymentStatus}</span></p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-chocolate dark:text-crema mb-2 border-b pb-1">Billed To:</h3>
          <p className="text-sm text-slateGray dark:text-latte">{order.customerId?.fullName || order.customer?.name || 'Walk-in Customer'}</p>
        </div>

        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-cacao text-left text-chocolate dark:text-crema">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-cacao last:border-0 text-slateGray dark:text-latte">
                <td className="py-2">{item.name}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">₹{item.price.toFixed(2)}</td>
                <td className="py-2 text-right">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end text-sm">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slateGray dark:text-latte">
              <span>Subtotal:</span>
              <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between text-slateGray dark:text-latte">
              <span>Tax ({settings?.gstPercentage || 5}%):</span>
              <span>₹{order.taxAmount?.toFixed(2) || '0.00'}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-mint">
                <span>Discount:</span>
                <span>-₹{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-chocolate dark:text-crema border-t pt-2 text-lg">
              <span>Total:</span>
              <span className="text-caramel">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body { background: white !important; }
          #root { display: none !important; }
          .backdrop-blur-sm { display: none !important; }
          
          .fixed.inset-0 { 
            position: absolute !important; 
            inset: 0 !important;
            display: block !important;
            padding: 0 !important;
          }
          
          .max-h-\\[90vh\\] { 
            max-height: none !important; 
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          .overflow-y-auto, .overflow-hidden { 
            overflow: visible !important; 
          }
          
          /* Hide bottom buttons during print */
          .mt-6.flex { display: none !important; }
          
          /* Hide Modal Header 'X' button */
          button { display: none !important; }
        }
      `}</style>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Download size={18} /> Download / Print
        </Button>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
