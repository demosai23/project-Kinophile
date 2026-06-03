import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';

export const addComment = asyncHandler(async (req, res) => {
  const { reviewId, body } = req.body;
  if (!reviewId || !body) { res.status(400); throw new Error('reviewId and body required'); }

  const review = await Review.findById(reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  const comment = await Comment.create({ userId: req.user.id, reviewId, body });
  await comment.populate('userId', 'username displayName avatar');

  if (review.userId.toString() !== req.user.id) {
    await Notification.create({
      recipientId: review.userId,
      senderId: req.user.id,
      type: 'review_comment',
      refId: review._id,
      refModel: 'Review',
      message: 'commented on your review',
    });
  }

  res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  if (comment.userId.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

export const getReviewComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ reviewId: req.params.reviewId })
    .populate('userId', 'username displayName avatar')
    .sort({ createdAt: 1 });
  res.json({ comments });
});