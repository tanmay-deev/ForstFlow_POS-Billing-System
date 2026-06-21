import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 10,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    flavor: {
      type: String,
    },
    size: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
