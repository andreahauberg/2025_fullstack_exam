import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Trending from "../components/Trending";
import WhoToFollow from "../components/WhoToFollow";
import PostDialog from "../components/PostDialog";
import LoadingOverlay from "../components/LoadingOverlay";
import { api } from "../api";
import { getProfilePictureUrl } from "../utils/imageUtils";
import { formatRelativeTime } from "../utils/timeUtils";
import { buildProfilePath } from "../utils/urlHelpers";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useNavigate } from "react-router-dom";
import { useAsideData } from "../hooks/useAsideData";
import "../css/NotificationsPage.css";

const NotificationsPage = () => {
  useDocumentTitle("Notifications");
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const {
    trending,
    trendingLoadingState,
    trendingError,
  } = useAsideData();

  const [usersToFollow, setUsersToFollow] = useState([]);
  const [usersLoadingState, setUsersLoadingState] = useState(false);

  const fetchUsersToFollow = async () => {
    setUsersLoadingState(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await api.get("/users-to-follow", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersToFollow(resp.data || []);
    } catch {
      setUsersToFollow([]);
    } finally {
      setUsersLoadingState(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsersToFollow();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await api.get(`/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = resp.data || {};
      setNotifications(data.data || []);
      setUnreadCount(data.meta?.unread_count ?? 0);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const goToProfileWithPost = (n) => {
    const postPk = n?.data?.post_pk;
    const authorUsername = n?.data?.author_username;
    const authorPk = n?.data?.author_pk;
    if (!authorUsername || !authorPk) return;
    const path = buildProfilePath({
      user_username: authorUsername,
      user_pk: authorPk,
    });
    if (!path || path === "#") return;
    const hash = postPk ? `#post-${postPk}` : "";
    navigate(`${path}${hash}`);
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAll = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/notifications/read-all`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {}
  };

  const isAnyLoading = loading || trendingLoadingState || usersLoadingState;

  return (
    <div data-testid="notifications-page">
      <div id="container">
        <NavBar setIsPostDialogOpen={setIsPostDialogOpen} isLoading={isAnyLoading} />

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
                        @{n.data?.author_username || ""} • {formatRelativeTime(n.data?.post_created_at || n.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="notification-card__actions">
                    {!n.read_at && (
                      <button onClick={() => markAsRead(n.id)} className="notification-card__btn">Mark</button>
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

        <aside className="user-aside">
          <Trending trending={trending} isLoading={trendingLoadingState} error={trendingError} />
          <WhoToFollow users={usersToFollow} isLoading={usersLoadingState} />
        </aside>
      </div>
    </div>
  );
};

export default NotificationsPage;
