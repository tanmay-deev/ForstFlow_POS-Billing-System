import { check, validationResult } from 'express-validator';

export const validateOrder = [
  check('items', 'Order must contain items').isArray({ min: 1 }),
  check('items.*.productId', 'Valid product ID is required for all items').isMongoId(),
  check('items.*.quantity', 'Valid quantity is required').isNumeric(),
  check('items.*.price', 'Valid price is required').isNumeric(),
  check('paymentMethod', 'Payment method is required').not().isEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array().map(err => err.msg).join(', '));
    }
    next();
  },
];
