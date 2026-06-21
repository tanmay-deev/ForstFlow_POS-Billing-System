import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

export const getDashboardMetrics = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const totalRevenueData = await Order.aggregate([
    { $match: { orderStatus: 'completed', createdAt: { $gte: startOfDay } } },
    { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } }
  ]);

  const lowStockCount = await Product.countDocuments({ 
    isAvailable: true, 
    $expr: { $lte: ['$stockQuantity', '$minStockLevel'] } 
  });

  const totalCustomers = await Customer.countDocuments({});

  return {
    todayRevenue: totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0,
    todayOrders: totalRevenueData.length > 0 ? totalRevenueData[0].totalOrders : 0,
    lowStockCount,
    totalCustomers
  };
};

export const getTopProducts = async () => {
  const topProducts = await Order.aggregate([
    { $match: { orderStatus: 'completed' } },
    { $unwind: '$items' },
    { $group: { 
        _id: '$items.productId', 
        name: { $first: '$items.name' },
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.total' }
      } 
    },
    { $sort: { totalSold: -1 } },
    { $limit: 4 }
  ]);
  return topProducts;
};
