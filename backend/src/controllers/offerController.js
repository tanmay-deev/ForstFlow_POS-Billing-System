import asyncHandler from 'express-async-handler';
import Offer from '../models/Offer.js';

export const getOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({});
  res.json({
    success: true,
    data: offers,
  });
});

export const createOffer = asyncHandler(async (req, res) => {
  const offer = new Offer(req.body);
  const createdOffer = await offer.save();
  res.status(201).json({
    success: true,
    message: 'Offer created successfully',
    data: createdOffer,
  });
});

export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (offer) {
    Object.assign(offer, req.body);
    const updatedOffer = await offer.save();
    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: updatedOffer,
    });
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});

export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (offer) {
    await offer.deleteOne();
    res.json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } else {
    res.status(404);
    throw new Error('Offer not found');
  }
});
