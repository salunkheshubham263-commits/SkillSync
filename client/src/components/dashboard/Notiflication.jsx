import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://192.168.0.111:5000";

const Notiflication = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setNotifications(response.data);

        await axios.patch(
          `${API_URL}/api/notifications/read-all`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,
            is_read: true,
          }))
        );
      } catch (err) {
        console.error(
          "Error fetching notifications:",
          err.response?.data || err
        );
      }
    };

    fetchNotifications();
  }, []);

  const getProfileImage = (notification) => {
    if (notification.profile_image) {
      return `${API_URL}/uploads/profiles/${notification.profile_image}`;
    }

    return "/profile_picture.png";
  };

  const handleAccept = async (notification) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${API_URL}/api/notifications/connections/${notification.connection_id}/respond`,
        {
          action: "accept",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item.notification_id === notification.notification_id
            ? {
                ...item,
                type: "connection_accepted",
                message: "You accepted the connection request",
                is_read: true,
              }
            : item
        )
      );

      console.log("Connection accepted:", response.data);
    } catch (err) {
      console.error(
        "Error accepting connection:",
        err.response?.data || err
      );
    }
  };

  const handleReject = async (notification) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${API_URL}/api/notifications/connections/${notification.connection_id}/respond`,
        {
          action: "reject",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item.notification_id === notification.notification_id
            ? {
                ...item,
                type: "connection_rejected",
                message: "You rejected the connection request",
                is_read: true,
              }
            : item
        )
      );

      console.log("Connection rejected:", response.data);
    } catch (err) {
      console.error(
        "Error rejecting connection:",
        err.response?.data || err
      );
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            notification.notification_id !== notificationId
        )
      );
    } catch (err) {
      console.error(
        "Error deleting notification:",
        err.response?.data || err
      );
    }
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all notifications?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications([]);
    } catch (err) {
      console.error(
        "Error deleting all notifications:",
        err.response?.data || err
      );
    }
  };

  return (
    <div className="notification-page">
      <div className="notification-header">
        <div>
          <h2>Notifications</h2>

          <span className="notification-count">
            {notifications.length}
          </span>
        </div>

        {notifications.length > 0 && (
          <button
            className="delete-all-button"
            onClick={handleDeleteAll}
          >
            Delete All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              className={`notification-card ${
                notification.is_read ? "read" : "unread"
              }`}
              key={notification.notification_id}
            >
              <div className="notification-user">
                <img
                  src={getProfileImage(notification)}
                  alt="Profile"
                  className="notification-pfp"
                />
              </div>

              <div className="notification-main">
                <div className="notification-content">
                  <strong>
                    {notification.first_name}{" "}
                    {notification.last_name}
                  </strong>

                  <span>{notification.message}</span>
                </div>

                <div className="notification-time">
                  {new Date(
                    notification.created_at
                  ).toLocaleString()}
                </div>

                {notification.type === "connection_request" && (
                  <div className="notification-actions">
                    <button
                      className="accept-button"
                      onClick={() =>
                        handleAccept(notification)
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="reject-button"
                      onClick={() =>
                        handleReject(notification)
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}

                <button
                  className="delete-notification-button"
                  onClick={() =>
                    handleDelete(
                      notification.notification_id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notiflication;