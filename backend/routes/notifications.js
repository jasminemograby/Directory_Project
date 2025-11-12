// Notifications Routes
const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

// Get user notifications
router.get('/', notificationsController.getNotifications);

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCountEndpoint);

// Mark notification as read
router.patch('/:id/read', notificationsController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationsController.markAllNotificationsAsRead);

// Delete notification
router.delete('/:id', notificationsController.deleteNotificationEndpoint);

module.exports = router;

