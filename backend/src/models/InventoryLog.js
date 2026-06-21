import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    actionType: {
      type: String,
      enum: ['stock_added', 'stock_removed', 'stock_adjusted', 'order_deduction'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

export default InventoryLog;
