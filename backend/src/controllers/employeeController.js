import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const getEmployees = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await User.countDocuments({});
  const employees = await User.find({}).select('-password')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: employees,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const employee = await User.create({
    ...req.body,
    createdBy: req.user._id,
  });

  if (employee) {
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        _id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid employee data');
  }
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);

  if (employee) {
    employee.fullName = req.body.fullName || employee.fullName;
    employee.phone = req.body.phone || employee.phone;
    employee.role = req.body.role || employee.role;
    
    if (req.body.password) {
      employee.password = req.body.password;
    }

    const updatedEmployee = await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        _id: updatedEmployee._id,
        fullName: updatedEmployee.fullName,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
      },
    });
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});

export const deactivateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);

  if (employee) {
    if (employee.email === 'admin@frostflow.com' || employee.email === 'admin@example.com') {
      res.status(400);
      throw new Error('Cannot deactivate the root admin user');
    }

    employee.isActive = false;
    await employee.save();

    res.json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});
