import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Trending from "../components/Trending";
import WhoToFollow from "../components/WhoToFollow";
import { api } from "../api";
import LoadingOverlay from "../components/LoadingOverlay";
import { getProfilePictureUrl } from "../utils/imageUtils";
import PostDialog from "../components/PostDialog";
import { formatRelativeTime } from "../utils/timeUtils";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [trending, setTrending] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

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
    } catch (err) {
      console.error("Failed to fetch notifications:", err.response || err.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [trendingResp, usersResp] = await Promise.all([api.get("/trending", { headers: { Authorization: `Bearer ${token}` } }), api.get("/users-to-follow", { headers: { Authorization: `Bearer ${token}` } })]);
      setTrending(trendingResp.data || []);
      setUsersToFollow(usersResp.data || []);
    } catch (err) {
      console.error("Failed to fetch sidebar data:", err.response || err.message);
      setTrending([]);
      setUsersToFollow([]);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/notifications/${id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark as read", err.response || err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to delete notification", err.response || err.message);
    }
  };

  const markAll = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/notifications/read-all`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err.response || err.message);
    }
  };

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />
      <main>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ margin: 0 }}>Notifications</h1>
          <div>
            <button onClick={markAll} disabled={unreadCount === 0} style={{ background: "transparent", border: "none", color: "var(--brand-color)", cursor: unreadCount === 0 ? "default" : "pointer" }}>
              Mark all as read
            </button>
          </div>
        </div>

        {loading && <LoadingOverlay message="Loading notifications..." />}

        {!loading && notifications.length === 0 && <p className="empty-message">No notifications</p>}

        {!loading && notifications.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n) => (
              <div key={n.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, background: n.read_at ? "#fff" : "#faf6ff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img src={getProfilePictureUrl(n.data?.author_profile_picture)} alt={n.data?.author_username || "avatar"} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{n.data?.excerpt || "New activity"}</div>
                    <div style={{ color: "#666", marginTop: 6 }}>
                      @{n.data?.author_username || ""} • {formatRelativeTime(n.data?.post_created_at || n.created_at)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {!n.read_at && (
                    <button onClick={() => markAsRead(n.id)} style={{ background: "transparent", border: "none", color: "var(--brand-color)", cursor: "pointer" }}>
                      Mark
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} title="Delete notification" style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <PostDialog isOpen={isPostDialogOpen} onClose={() => setIsPostDialogOpen(false)} onSuccess={(newPost) => {}} />
      <aside>
        <Trending trending={trending} />
        <WhoToFollow users={usersToFollow} />
      </aside>
    </div>
  );
};

export default NotificationsPage;
