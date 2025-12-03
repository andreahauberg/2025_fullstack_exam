import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Trending from "../components/Trending";
import WhoToFollow from "../components/WhoToFollow";
import { api } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { getProfilePictureUrl } from "../utils/imageUtils";
import PostDialog from "../components/PostDialog";
import { formatRelativeTime } from "../utils/timeUtils";
import { buildProfilePath } from "../utils/urlHelpers";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";
import "../css/NotificationsPage.css";

const NotificationsPage = () => {
  useDocumentTitle("Notifications");

  const { isAuthenticated, loading: authLoading, user: authUser } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [trending, setTrending] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchSidebarData();
  }, []);

  if (authLoading) return <LoadingOverlay message="Initializing session…" />;
  if (!isAuthenticated) return <Navigate to="/" replace />;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const resp = await api.get("/notifications");
      const data = resp.data || {};
      setNotifications(data.data || []);
      setUnreadCount(data.meta?.unread_count ?? 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebarData = async () => {
    try {
      const [trendingResp, usersResp] = await Promise.all([
        api.get("/trending"),
        api.get("/users-to-follow"),
      ]);
      setTrending(trendingResp.data || []);
      setUsersToFollow(usersResp.data || []);
    } catch (err) {
      console.error("Failed to fetch sidebar:", err);
    }
  };

  const goToProfileWithPost = (n) => {
    const postPk = n?.data?.post_pk;
    const authorUsername = n?.data?.author_username;
    const authorPk = n?.data?.author_pk;

    if (!authorUsername || !authorPk) return;

    const base = buildProfilePath(
      {
        user_username: authorUsername,
        user_pk: authorPk,
      },
      { currentUser: authUser }
    );

    const hash = postPk ? `#post-${postPk}` : "";
    navigate(`${base}${hash}`);
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const markAll = async () => {
    try {
      await api.post(`/notifications/read-all`);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all", err);
    }
  };

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
                className={`notification-card ${
                  !n.read_at ? "notification-card--unread" : ""
                }`}
              >
                <div
                  className="notification-card__clickzone"
                  onClick={() => goToProfileWithPost(n)}
                  role="button"
                  tabIndex={0}
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
                      @{n.data?.author_username} •{" "}
                      {formatRelativeTime(
                        n.data?.post_created_at || n.created_at
                      )}
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
      />

      <aside>
        <Trending trending={trending} />
        <WhoToFollow users={usersToFollow} />
      </aside>
    </div>
  );
};

export default NotificationsPage;
