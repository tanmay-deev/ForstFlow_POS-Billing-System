import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import connectDB from './src/config/db.js';

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }

    const admin = new User({
      fullName: 'System Admin',
      email: 'admin@example.com',
      password: '123456', // According to PDF mock data example
      phone: '1234567890',
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log('Default admin seeded: admin@example.com / 123456');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
