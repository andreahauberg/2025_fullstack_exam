// NotificationCount.jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

const NotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeta = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const resp = await api.get(`/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = resp.data || {};
        setUnreadCount(data.meta?.unread_count ?? 0);
      } catch (err) {
        console.error("Failed to fetch notifications meta", err.response || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, []);

  const goToNotifications = () => {
    if (!loading) {
      navigate("/notifications");
    }
  };

  const displayCount = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <button className="nav-notifications-button" onClick={goToNotifications} aria-label="Notifications" title="Notifications">
      <i className="fa-regular fa-bell" aria-hidden="true"></i>
      <span>Notifications</span>
      {unreadCount > 0 && (
        <span className="nav-flag" aria-hidden="true">
          {displayCount}
        </span>
      )}
    </button>
  );
};

export default NotificationCount;
