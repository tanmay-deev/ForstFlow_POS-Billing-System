import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    businessLogo: {
      type: String,
    },
    gstPercentage: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    gstNumber: {
      type: String,
    },
    address: {
      type: String,
    },
    invoicePrefix: {
      type: String,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
