import cloudinary from './src/config/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", { folder: "test" })
  .then(res => {
    console.log("Success:", res.secure_url);
    process.exit(0);
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });
