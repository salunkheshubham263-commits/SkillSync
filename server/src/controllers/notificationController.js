const pool = require("../config/db");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        n.notification_id,
        n.user_id,
        n.sender_id,
        n.connection_id,
        n.type,
        n.message,
        n.is_read,
        n.created_at,
        u.first_name,
        u.last_name,
        u.username,
        p.profile_image
      FROM notifications n
      INNER JOIN users u
        ON n.sender_id = u.user_id
      LEFT JOIN profiles p
        ON n.sender_id = p.user_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      `,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error getting notifications:", err);

    res.status(500).json({
      message: "Failed to get notifications",
      error: err.message,
    });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = $1
      AND is_read = false
      `,
      [userId]
    );

    res.status(200).json({
      unread_count: parseInt(result.rows[0].unread_count),
    });
  } catch (err) {
    console.error("Error getting unread count:", err);

    res.status(500).json({
      message: "Failed to get unread notification count",
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.notification_id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        message: "Invalid notification id",
      });
    }

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE notification_id = $1
      AND user_id = $2
      RETURNING *
      `,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification: result.rows[0],
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);

    res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1
      AND is_read = false
      `,
      [userId]
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);

    res.status(500).json({
      message: "Failed to mark notifications as read",
    });
  }
};

const respondToConnection = async (req, res) => {
  try {
    const { connection_id } = req.params;
    const { action } = req.body;
    const userId = req.user.id;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Action must be either accept or reject",
      });
    }

    const connection = await pool.query(
      `
      SELECT *
      FROM connections
      WHERE connection_id = $1
      AND receiver_id = $2
      AND status = 'pending'
      `,
      [connection_id, userId]
    );

    if (connection.rows.length === 0) {
      return res.status(404).json({
        message: "Connection request not found or already handled",
      });
    }

    const currentConnection = connection.rows[0];

    const senderId = currentConnection.sender_id;
    const receiverId = currentConnection.receiver_id;

    const newStatus =
      action === "accept" ? "accepted" : "rejected";

    const newType =
      action === "accept"
        ? "connection_accepted"
        : "connection_rejected";

    const newMessage =
      action === "accept"
        ? "You accepted the connection request"
        : "You rejected the connection request";

    const result = await pool.query(
      `
      UPDATE connections
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE connection_id = $2
      AND receiver_id = $3
      RETURNING *
      `,
      [newStatus, connection_id, userId]
    );

    await pool.query(
      `
      UPDATE notifications
      SET
        type = $1,
        message = $2
      WHERE connection_id = $3
      AND user_id = $4
      AND type = 'connection_request'
      `,
      [
        newType,
        newMessage,
        connection_id,
        receiverId,
      ]
    );

    await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        sender_id,
        connection_id,
        type,
        message
      )
      VALUES
      ($1, $2, $3, $4, $5)
      `,
      [
        senderId,
        receiverId,
        connection_id,
        newType,
        action === "accept"
          ? "accepted your connection request"
          : "rejected your connection request",
      ]
    );

    const io = req.app.get("io");

    if (io) {
      io.to(`user:${senderId}`).emit("connection_response", {
        connection_id,
        sender_id: senderId,
        receiver_id: receiverId,
        status: newStatus,
        action,
      });
    }

    return res.status(200).json({
      message: `Connection request ${newStatus}`,
      connection: result.rows[0],
    });
  } catch (err) {
    console.error("Error responding to connection:", err);

    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.notification_id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        message: "Invalid notification id",
      });
    }

    const notification = await pool.query(
      `
      SELECT
        notification_id,
        user_id,
        connection_id,
        type
      FROM notifications
      WHERE notification_id = $1
      AND user_id = $2
      `,
      [notificationId, userId]
    );

    if (notification.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const currentNotification = notification.rows[0];

    if (
      currentNotification.type === "connection_request" &&
      currentNotification.connection_id
    ) {
      await pool.query(
        `
        UPDATE connections
        SET
          status = 'rejected',
          updated_at = CURRENT_TIMESTAMP
        WHERE connection_id = $1
        AND receiver_id = $2
        AND status = 'pending'
        `,
        [
          currentNotification.connection_id,
          userId,
        ]
      );
    }

    await pool.query(
      `
      DELETE FROM notifications
      WHERE notification_id = $1
      AND user_id = $2
      `,
      [notificationId, userId]
    );

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting notification:", err);

    res.status(500).json({
      message: "Failed to delete notification",
      error: err.message,
    });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      `
      UPDATE connections c
      SET
        status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
      WHERE c.status = 'pending'
      AND c.receiver_id = $1
      AND EXISTS (
        SELECT 1
        FROM notifications n
        WHERE n.connection_id = c.connection_id
        AND n.user_id = $1
        AND n.type = 'connection_request'
      )
      `,
      [userId]
    );

    const result = await pool.query(
      `
      DELETE FROM notifications
      WHERE user_id = $1
      RETURNING notification_id
      `,
      [userId]
    );

    res.status(200).json({
      message: "All notifications deleted successfully",
      delete_count: result.rows.length,
    });
  } catch (err) {
    console.error("Error deleting all notifications:", err);

    res.status(500).json({
      message: "Failed to delete all notifications",
      error: err.message,
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  respondToConnection,
  deleteNotification,
  deleteAllNotifications,
};