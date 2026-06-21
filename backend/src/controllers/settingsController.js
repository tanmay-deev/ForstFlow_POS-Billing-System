import asyncHandler from 'express-async-handler';
import Settings from '../models/Settings.js';

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    // Return default settings if none exist
    settings = new Settings({
      businessName: 'FrostFlow',
      gstPercentage: 5,
      currency: 'USD',
    });
    await settings.save();
  }
  res.json({
    success: true,
    data: settings,
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (settings) {
    Object.assign(settings, req.body);
    settings.updatedBy = req.user._id;
    const updatedSettings = await settings.save();
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } else {
    res.status(404);
    throw new Error('Settings not found');
  }
});
