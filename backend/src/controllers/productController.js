import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 1000;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.search
    ? {
        name: {
          $regex: req.query.search,
          $options: 'i',
        },
      }
    : {};

  const filter = { ...keyword, isAvailable: true };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate('categoryId', 'name slug')
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

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryId', 'name slug');

  if (product) {
    res.json({
      success: true,
      data: product,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export const createProduct = asyncHandler(async (req, res) => {
  let { name, sku, slug } = req.body;

  if (!slug && name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  if (!sku) {
    sku = 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const product = new Product({
    ...req.body,
    slug,
    sku,
    createdBy: req.user._id,
  });

  const createdProduct = await product.save();
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: createdProduct,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isAvailable = false;
    await product.save();
    res.json({
      success: true,
      message: 'Product soft deleted successfully',
    });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
