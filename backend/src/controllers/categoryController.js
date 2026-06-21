import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true });
  res.json({
    success: true,
    data: categories,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  let { name, slug } = req.body;
  
  if (!slug && name) {
    slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  const category = new Category({ ...req.body, slug });
  const createdCategory = await category.save();
  
  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: createdCategory,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    Object.assign(category, req.body);
    const updatedCategory = await category.save();
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.isActive = false;
    await category.save();
    res.json({
      success: true,
      message: 'Category soft deleted successfully',
    });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});
