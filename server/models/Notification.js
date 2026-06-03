import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['follow', 'review_like', 'review_comment', 'list_like', 'list_comment'],
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    refModel: {
      type: String,
      enum: ['Review', 'List', 'User', null],
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;