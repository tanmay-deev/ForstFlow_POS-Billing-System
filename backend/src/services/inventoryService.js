import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import Notification from '../models/Notification.js';

export const reduceInventory = async (items, userId, reason = 'order_deduction') => {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    
    if (!product) {
      throw new Error(`Product not found: ${item.name}`);
    }

    if (product.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    const previousStock = product.stockQuantity;
    product.stockQuantity -= item.quantity;
    
    // Automatically become unavailable if stock <= 0
    if (product.stockQuantity <= 0) {
      product.isAvailable = false;
    }

    // Low stock notification
    if (product.stockQuantity <= 10 && previousStock > 10) {
      await Notification.create({
        title: 'Low Stock Alert',
        message: `${product.name} is down to ${product.stockQuantity} units!`,
        type: 'warning',
        relatedEntity: `product_${product._id}`
      });
    }

    await product.save();

    await InventoryLog.create({
      productId: product._id,
      actionType: reason,
      quantity: item.quantity,
      previousStock,
      newStock: product.stockQuantity,
      performedBy: userId,
      reason: 'Order placement',
    });
  }
};
