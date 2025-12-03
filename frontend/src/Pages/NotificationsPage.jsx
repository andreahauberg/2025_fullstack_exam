import React, { useEffect, useState, useCallback } from "react";
import NavBar from "../components/NavBar";
import Trending from "../components/Trending";
import WhoToFollow from "../components/WhoToFollow";
import { api } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { getProfilePictureUrl } from "../utils/imageUtils";
import PostDialog from "../components/PostDialog";
import { formatRelativeTime } from "../utils/timeUtils";
import { useNavigate } from "react-router-dom";
import { buildProfilePath } from "../utils/urlHelpers";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../css/NotificationsPage.css";

const NotificationsPage = () => {
  useDocumentTitle("Notifications");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [trending, setTrending] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ----------------------
  // Fetch: Notifications
  // ----------------------
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = resp.data || {};
      setNotifications(data.data || []);
      setUnreadCount(data.meta?.unread_count ?? 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err.response || err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ----------------------
  // Fetch: Sidebar
  // ----------------------
  const fetchSidebarData = useCallback(async () => {
    try {
      const [t, u] = await Promise.all([
        api.get("/trending", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/users-to-follow", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTrending(t.data || []);
      setUsersToFollow(u.data || []);
    } catch (err) {
      console.error("Failed to fetch sidebar data:", err.response || err.message);
      setTrending([]);
      setUsersToFollow([]);
    }
  }, [token]);

  // Init loads
  useEffect(() => {
    fetchNotifications();
    fetchSidebarData();
  }, [fetchNotifications, fetchSidebarData]);

  // ----------------------
  // Navigation helpers
  // ----------------------
  const goToProfileWithPost = useCallback(
    (n) => {
      const authorUsername = n?.data?.author_username;
      const authorPk = n?.data?.author_pk;
      if (!authorUsername || !authorPk) return;

      const path = buildProfilePath({ user_username: authorUsername, user_pk: authorPk });
      if (!path || path === "#") return;

      const postPk = n?.data?.post_pk;
      navigate(`${path}${postPk ? `#post-${postPk}` : ""}`);
    },
    [navigate]
  );

  // ----------------------
  // Actions
  // ----------------------
  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark as read", err.response || err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err.response || err.message);
    }
  };

  const markAll = async () => {
    try {
      await api.post(`/notifications/read-all`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err.response || err.message);
    }
  };

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />

      <main>
        <div className="notifications-header">
          <h1 className="notifications-header__title">Notifications</h1>
          <button
            onClick={markAll}
            disabled={unreadCount === 0}
            className="notifications-header__mark-all"
          >
            Mark all as read
          </button>
        </div>

        {loading && <LoadingOverlay message="Loading notifications..." />}

        {!loading && notifications.length === 0 && (
          <p className="empty-message">No notifications</p>
        )}

        {!loading && notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-card ${!n.read_at ? "notification-card--unread" : ""}`}
              >
                <div
                  className="notification-card__clickzone"
                  onClick={() => goToProfileWithPost(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && goToProfileWithPost(n)}
                >
                  <img
                    src={getProfilePictureUrl(n.data?.author_profile_picture)}
                    alt={n.data?.author_username || "avatar"}
                    className="notification-card__avatar"
                  />

                  <div className="notification-card__content">
                    <div className="notification-card__text">
                      {n.data?.excerpt || "New activity"}
                    </div>
                    <div className="notification-card__meta">
                      @{n.data?.author_username || ""} •{" "}
                      {formatRelativeTime(n.data?.post_created_at || n.created_at)}
                    </div>
                  </div>
                </div>

                <div className="notification-card__actions">
                  {!n.read_at && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="notification-card__btn"
                    >
                      Mark
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="notification-card__btn notification-card__btn--delete"
                    title="Delete notification"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSuccess={() => {}}
      />

      <aside>
        <Trending trending={trending} />
        <WhoToFollow users={usersToFollow} />
      </aside>
    </div>
  );
};

export default NotificationsPage;