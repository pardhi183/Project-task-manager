import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      notifications: notifications.map((notification) => ({
        ...notification.toObject(),
        isRead: notification.readBy.some((userId) => userId.equals(req.user._id))
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const notification = await Notification.create({
      title: req.body.title,
      message: req.body.message,
      createdBy: req.user._id
    });

    const populatedNotification = await Notification.findById(notification._id).populate('createdBy', 'name role');
    res.status(201).json({ notification: populatedNotification });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (!notification.readBy.some((userId) => userId.equals(req.user._id))) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.json({ notification });
  } catch (error) {
    next(error);
  }
};
