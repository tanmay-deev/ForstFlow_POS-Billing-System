import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';

export const getInventoryStatus = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await Product.countDocuments({ isActive: true });
  const products = await Product.find({ isActive: true })
    .select('name stockQuantity minStockLevel sku isAvailable')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

export const restockProduct = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const product = await Product.findById(req.params.productId);

  if (product) {
    const previousStock = product.stockQuantity;
    product.stockQuantity += Number(quantity);
    product.isAvailable = product.stockQuantity > 0;
    
    await product.save();

    await InventoryLog.create({
      productId: product._id,
      actionType: 'stock_added',
      quantity: Number(quantity),
      previousStock,
      newStock: product.stockQuantity,
      performedBy: req.user._id,
      reason: 'Restocking',
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export const getInventoryLogs = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;

  const count = await InventoryLog.countDocuments({});
  const logs = await InventoryLog.find({})
    .populate('productId', 'name sku')
    .populate('performedBy', 'fullName')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: logs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

export const deleteAllInventoryLogs = asyncHandler(async (req, res) => {
  await InventoryLog.deleteMany({});
  res.json({
    success: true,
    message: 'All inventory logs deleted successfully',
  });
});
