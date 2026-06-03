import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user.id })
    .populate('senderId', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    recipientId: req.user.id,
    read: false,
  });

  res.json({ notifications, unreadCount });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user.id, read: false },
    { read: true }
  );
  res.json({ message: 'All notifications marked as read' });
});

export const markOneRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: 'Notification marked as read' });
});