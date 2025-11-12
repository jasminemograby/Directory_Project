// Notifications Controller
const { query } = require('../config/database');

/**
 * Get all notifications for a user (by email)
 * @param {string} userEmail - User email address
 * @param {Object} options - Query options (limit, offset, unreadOnly)
 * @returns {Promise<Array>}
 */
const getUserNotifications = async (userEmail, options = {}) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    let sql = `
      SELECT 
        n.id,
        n.company_id,
        n.type,
        n.recipient_email,
        n.message,
        n.status,
        n.message_id,
        n.created_at,
        n.read_at,
        c.name as company_name
      FROM notifications n
      LEFT JOIN companies c ON n.company_id = c.id
      WHERE n.recipient_email = $1
    `;

    const params = [userEmail];

    if (unreadOnly) {
      sql += ' AND n.read_at IS NULL';
    }

    sql += ' ORDER BY n.created_at DESC LIMIT $2 OFFSET $3';
    params.push(limit, offset);

    const result = await query(sql, params);

    return result.rows;
  } catch (error) {
    console.error('Error getting user notifications:', error.message);
    throw error;
  }
};

/**
 * Get unread notification count for a user
 * @param {string} userEmail - User email address
 * @returns {Promise<number>}
 */
const getUnreadCount = async (userEmail) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE recipient_email = $1 AND read_at IS NULL`,
      [userEmail]
    );

    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error getting unread count:', error.message);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userEmail - User email (for verification)
 * @returns {Promise<boolean>}
 */
const markAsRead = async (notificationId, userEmail) => {
  try {
    const result = await query(
      `UPDATE notifications 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND recipient_email = $2 AND read_at IS NULL
       RETURNING id`,
      [notificationId, userEmail]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userEmail - User email address
 * @returns {Promise<number>} - Number of notifications marked as read
 */
const markAllAsRead = async (userEmail) => {
  try {
    const result = await query(
      `UPDATE notifications 
       SET read_at = CURRENT_TIMESTAMP 
       WHERE recipient_email = $1 AND read_at IS NULL
       RETURNING id`,
      [userEmail]
    );

    return result.rows.length;
  } catch (error) {
    console.error('Error marking all notifications as read:', error.message);
    throw error;
  }
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @param {string} userEmail - User email (for verification)
 * @returns {Promise<boolean>}
 */
const deleteNotification = async (notificationId, userEmail) => {
  try {
    const result = await query(
      `DELETE FROM notifications 
       WHERE id = $1 AND recipient_email = $2
       RETURNING id`,
      [notificationId, userEmail]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting notification:', error.message);
    throw error;
  }
};

/**
 * API endpoint: Get user notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { user_email } = req.query;
    const { limit, offset, unread_only } = req.query;

    if (!user_email) {
      return res.status(400).json({
        success: false,
        error: 'user_email query parameter is required',
      });
    }

    const options = {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      unreadOnly: unread_only === 'true',
    };

    const notifications = await getUserNotifications(user_email, options);
    const unreadCount = await getUnreadCount(user_email);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (error) {
    console.error('Error in getNotifications:', error.message);
    next(error);
  }
};

/**
 * API endpoint: Get unread count
 */
const getUnreadCountEndpoint = async (req, res, next) => {
  try {
    const { user_email } = req.query;

    if (!user_email) {
      return res.status(400).json({
        success: false,
        error: 'user_email query parameter is required',
      });
    }

    const count = await getUnreadCount(user_email);

    res.json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    console.error('Error in getUnreadCountEndpoint:', error.message);
    next(error);
  }
};

/**
 * API endpoint: Mark notification as read
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_email } = req.body;

    if (!user_email) {
      return res.status(400).json({
        success: false,
        error: 'user_email is required',
      });
    }

    const success = await markAsRead(id, user_email);

    if (success) {
      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Notification not found or already read',
      });
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error.message);
    next(error);
  }
};

/**
 * API endpoint: Mark all notifications as read
 */
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { user_email } = req.body;

    if (!user_email) {
      return res.status(400).json({
        success: false,
        error: 'user_email is required',
      });
    }

    const count = await markAllAsRead(user_email);

    res.json({
      success: true,
      message: `${count} notification(s) marked as read`,
      data: {
        count,
      },
    });
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error.message);
    next(error);
  }
};

/**
 * API endpoint: Delete notification
 */
const deleteNotificationEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_email } = req.body;

    if (!user_email) {
      return res.status(400).json({
        success: false,
        error: 'user_email is required',
      });
    }

    const success = await deleteNotification(id, user_email);

    if (success) {
      res.json({
        success: true,
        message: 'Notification deleted',
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Notification not found',
      });
    }
  } catch (error) {
    console.error('Error in deleteNotificationEndpoint:', error.message);
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotifications,
  getUnreadCountEndpoint,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationEndpoint,
};

