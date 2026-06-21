import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const p = await Product.findOne({ name: 'sakuuuuuuuu' });
    console.log(p);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
