import asyncHandler from 'express-async-handler';
import Customer from '../models/Customer.js';

export const getCustomers = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await Customer.countDocuments({});
  const customers = await Customer.find({})
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: customers,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (customer) {
    res.json({
      success: true,
      data: customer,
    });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = new Customer(req.body);
  const createdCustomer = await customer.save();
  
  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: createdCustomer,
  });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    Object.assign(customer, req.body);
    const updatedCustomer = await customer.save();
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer,
    });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  // Using permanent delete or could use soft delete depending on strict rules.
  // PDF says: "Customer history should remain preserved even after inactivity." 
  // Wait, if it has orders, don't delete. Let's just do a soft delete pattern if needed, or error out if has orders.
  if (customer) {
    if (customer.totalOrders > 0) {
      res.status(400);
      throw new Error('Cannot delete customer with existing orders');
    }
    await customer.deleteOne();
    res.json({
      success: true,
      message: 'Customer removed',
    });
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});
