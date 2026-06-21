import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import Notification from '../models/Notification.js';
import { processOrderCompletion } from '../services/orderService.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod, customerId, discountAmount, notes } = req.body;

  if (items && items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Fetch settings for dynamic tax
    let settings = await Settings.findOne();
    const taxRate = settings ? settings.gstPercentage / 100 : 0.05;

    // Calculate prices
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxAmount = Number((taxRate * subtotal).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount - (discountAmount || 0)).toFixed(2));
    const orderNumber = 'ORD' + Date.now();

    const order = new Order({
      orderNumber,
      items,
      cashierId: req.user._id,
      customerId,
      paymentMethod,
      subtotal,
      taxAmount,
      discountAmount: discountAmount || 0,
      totalAmount,
      notes,
    });

    const createdOrder = await order.save();

    // High Value Order Notification
    if (totalAmount >= 1000) {
      await Notification.create({
        title: 'High-Value Order',
        message: `A high-value order (₹${totalAmount}) was just processed!`,
        type: 'success',
        relatedEntity: `order_${createdOrder._id}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder,
    });
  }
});

export const getOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate('cashierId', 'fullName')
    .populate('customerId', 'fullName')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('cashierId', 'fullName')
    .populate('customerId', 'fullName phone email');

  if (order) {
    res.json({
      success: true,
      data: order,
    });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (status === 'completed' && order.orderStatus !== 'completed') {
      const updatedOrder = await processOrderCompletion(order._id, req.user._id);
      res.json({
        success: true,
        message: 'Order completed and inventory updated',
        data: updatedOrder,
      });
    } else {
      order.orderStatus = status;
      const updatedOrder = await order.save();
      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: updatedOrder,
      });
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export const getInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.invoiceUrl) {
    res.json({
      success: true,
      data: { invoiceUrl: order.invoiceUrl },
    });
  } else {
    res.status(404);
    throw new Error('Invoice not found or order not completed yet');
  }
});

export const deleteAllOrders = asyncHandler(async (req, res) => {
  await Order.deleteMany({});
  res.json({
    success: true,
    message: 'All orders deleted successfully',
  });
});
