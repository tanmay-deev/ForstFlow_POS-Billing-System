import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

export const getDailySales = asyncHandler(async (req, res) => {
  let { startDate, endDate } = req.query;
  let start = new Date();
  start.setHours(0, 0, 0, 0);
  let end = new Date();
  end.setHours(23, 59, 59, 999);

  if (startDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
  }
  if (endDate) {
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  }

  const sales = await Order.find({
    orderStatus: 'completed',
    createdAt: { $gte: start, $lte: end }
  }).populate('cashierId', 'fullName').sort({ createdAt: -1 });

  res.json({
    success: true,
    data: sales,
  });
});

export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const revenue = await Order.aggregate([
    { $match: { orderStatus: 'completed', createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  res.json({
    success: true,
    data: {
      month: startOfMonth.toISOString().substring(0, 7),
      revenue: revenue.length > 0 ? revenue[0].total : 0
    },
  });
});

export const getProductPerformance = asyncHandler(async (req, res) => {
  const performance = await Order.aggregate([
    { $match: { orderStatus: 'completed' } },
    { $unwind: '$items' },
    { $group: { 
        _id: '$items.productId', 
        name: { $first: '$items.name' },
        quantitySold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' }
      } 
    },
    { $sort: { quantitySold: -1 } }
  ]);

  res.json({
    success: true,
    data: performance,
  });
});

export const getInventoryReport = asyncHandler(async (req, res) => {
  // Can just redirect to inventory status or add more metrics
  res.redirect('/api/inventory');
});
