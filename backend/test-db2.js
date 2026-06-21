import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const p = await Order.findOne({ orderNumber: 'ORD1781704145614' });
    console.log(JSON.stringify(p, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
