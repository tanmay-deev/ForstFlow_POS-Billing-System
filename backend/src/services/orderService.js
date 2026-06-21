import Order from '../models/Order.js';
import { reduceInventory } from './inventoryService.js';
import Customer from '../models/Customer.js';

export const processOrderCompletion = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.orderStatus === 'completed') {
    throw new Error('Order is already completed');
  }

  // Reduce inventory
  await reduceInventory(order.items, userId, 'order_deduction');

  // Update customer stats if customer exists
  if (order.customerId) {
    const customer = await Customer.findById(order.customerId);
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += order.totalAmount;
      // 1 loyalty point per dollar spent
      customer.loyaltyPoints += Math.floor(order.totalAmount);
      await customer.save();
    }
  }

  // Update order status
  order.orderStatus = 'completed';
  order.paymentStatus = 'paid';
  // generate invoice (mock url for now)
  order.invoiceUrl = `/invoices/${order.orderNumber}.pdf`;
  
  await order.save();
  return order;
};
