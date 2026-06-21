import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';
import Offer from '../models/Offer.js';

export const getNotifications = asyncHandler(async (req, res) => {
  // Check for expiring offers (within 3 days)
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const expiringOffers = await Offer.find({
    isActive: true,
    endDate: { $lte: threeDaysFromNow, $gt: new Date() }
  });

  for (const offer of expiringOffers) {
    const relatedEntity = `offer_expiring_${offer._id}`;
    const exists = await Notification.findOne({ relatedEntity });
    if (!exists) {
      await Notification.create({
        title: 'Offer Expiring Soon',
        message: `The offer "${offer.title || offer.code}" is expiring on ${new Date(offer.endDate).toLocaleDateString()}.`,
        type: 'warning',
        relatedEntity
      });
    }
  }

  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  const count = await Notification.countDocuments({});
  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: notifications,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification) {
    notification.isRead = true;
    await notification.save();
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } else {
    res.status(404);
    throw new Error('Notification not found');
  }
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ isRead: false }, { isRead: true });
  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});
