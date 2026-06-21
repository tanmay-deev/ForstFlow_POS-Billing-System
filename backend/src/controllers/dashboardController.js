import asyncHandler from 'express-async-handler';
import { getDashboardMetrics, getTopProducts } from '../services/analyticsService.js';
import Order from '../models/Order.js';

export const getSummary = asyncHandler(async (req, res) => {
  const metrics = await getDashboardMetrics();
  res.json({
    success: true,
    data: metrics,
  });
});

export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  // simplified revenue analytics for a period, e.g. last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const revenueByDay = await Order.aggregate([
    { $match: { orderStatus: 'completed', createdAt: { $gte: sevenDaysAgo } } },
    { 
      $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
        revenue: { $sum: '$totalAmount' } 
      } 
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    data: revenueByDay,
  });
});

export const getTopProductsAnalytics = asyncHandler(async (req, res) => {
  const topProducts = await getTopProducts();
  res.json({
    success: true,
    data: topProducts,
  });
});
