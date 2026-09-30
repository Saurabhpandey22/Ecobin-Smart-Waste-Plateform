/**
 * Ecobin Notifications Controller
 */

const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = db.findMany(
      'notifications',
      n => n.user_id === userId,
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (id === 'all') {
      const userNotifs = db.findMany('notifications', n => n.user_id === userId && !n.is_read);
      userNotifs.forEach(n => db.update('notifications', n.id, { is_read: 1 }));
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }

    const notif = db.findOne('notifications', n => n.id === Number(id) && n.user_id === userId);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });

    const updated = db.update('notifications', notif.id, { is_read: 1 });
    res.status(200).json({ success: true, notification: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark notification read.', error: err.message });
  }
};
