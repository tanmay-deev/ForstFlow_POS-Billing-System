import { check, validationResult } from 'express-validator';

export const validateProduct = [
  check('name', 'Product name is required').not().isEmpty(),
  check('slug', 'Product slug is required').not().isEmpty(),
  check('categoryId', 'Valid Category ID is required').isMongoId(),
  check('price', 'Valid price is required').isNumeric(),
  check('sku', 'Product SKU is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map(err => err.msg).join(', '));
    }
    next();
  },
];
