import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { api } from "../api";
import NavBar from "../components/NavBar";
import WhoToFollow from "../components/WhoToFollow";
import Trending from "../components/Trending";
import UserHeader from "../components/UserHeader";
import UserList from "../components/UserList";
import UserPosts from "../components/UserPosts";
import UserTabs from "../components/UserTabs";
import Post from "../components/Post";
import ConfirmationDialog from "../components/ConfirmationDialog";
import PostDialog from "../components/PostDialog";
import LoadingOverlay from "../components/LoadingOverlay";
import "../css/UserPage.css";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useFollowActions } from "../hooks/useFollowActions";
import { useProfileData } from "../hooks/useProfileData";

const UserPage = () => {
  const { username } = useParams();
  const location = useLocation();

  const {
    user,
    setUser,
    followers,
    following,
    usersToFollow,
    trending,
    isFollowing,
    setIsFollowing,
    isLoading,
    error,
    setError,
  } = useProfileData(username, { requireAuth: false });

  const { handleFollowToggle } = useFollowActions({
    user,
    setUser,
    followers,
    following,
    isFollowing,
    setIsFollowing,
    setError,
  });

  const [activeTab, setActiveTab] = useState("posts");
  const [repostPosts, setRepostPosts] = useState([]);
  const [isRepostsLoading, setIsRepostsLoading] = useState(false);
  const [hasMoreReposts, setHasMoreReposts] = useState(true);

  const pageRef = useRef(1);
  const loadedRef = useRef(false);

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const profileTitle = user?.user_username
    ? `${user.user_full_name || user.user_username} (@${user.user_username}) / Weave`
    : "Profile";

  useDocumentTitle(profileTitle);

  const fetchReposts = useCallback(async () => {
    if (isRepostsLoading || !hasMoreReposts) return;

    setIsRepostsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await api.get(
        `/users/${username}/reposts?page=${pageRef.current}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const incoming = resp.data.data ?? [];
      if (incoming.length === 0) {
        setHasMoreReposts(false);
        return;
      }

      setRepostPosts((prev) => [
        ...prev,
        ...incoming.filter((p) => !prev.some((x) => x.post_pk === p.post_pk)),
      ]);

      pageRef.current += 1;
      loadedRef.current = true;
    } catch {
      setHasMoreReposts(false);
    } finally {
      setIsRepostsLoading(false);
    }
  }, [username, isRepostsLoading, hasMoreReposts]);

  useEffect(() => {
    if (activeTab !== "reposts") return;

    setRepostPosts([]);
    setHasMoreReposts(true);
    pageRef.current = 1;
    loadedRef.current = false;

    fetchReposts();
  }, [username, activeTab, fetchReposts]);

  useEffect(() => {
    const handler = () => {
      if (activeTab !== "reposts") return;

      const scrollPos = window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 300;

      if (scrollPos >= threshold) fetchReposts();
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [activeTab, fetchReposts]);

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const id = hash.replace("#", "");
    let attempts = 0;

    const scrollAttempt = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (attempts < 6) {
        attempts++;
        setTimeout(scrollAttempt, 300);
      }
    };

    setTimeout(scrollAttempt, 50);
  }, [user, location.hash]);

  if (isLoading) return <LoadingOverlay message="Loading profile..." />;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="error">User not found.</p>;

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />

      <main className="user-main">
        <UserHeader
          user={user}
          setUser={setUser}
          isCurrentUser={false}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          onDeleteProfile={() => setIsDeleteDialogOpen(true)}
        />

        <UserTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          followersCount={followers.length}
          followingCount={following.length}
          postsCount={user.posts_count || 0}
          repostCount={user.reposts_count || 0}
        />

        <div className="user-tab-panels">
          {activeTab === "posts" && (
            <UserPosts userPk={user.user_pk} isCurrentUser={false} />
          )}

          {activeTab === "reposts" && (
            <>
              {isRepostsLoading && <p className="loading-message">Loading reposts…</p>}
              {repostPosts.length === 0 && !isRepostsLoading && (
                <p className="empty-message">No reposts yet.</p>
              )}
              {repostPosts.map((post) => (
                <Post key={post.post_pk} post={post} hideHeader={false} />
              ))}
            </>
          )}

          {activeTab === "followers" && (
            <UserList title="Followers" users={followers} emptyMessage="No followers yet." />
          )}

          {activeTab === "following" && (
            <UserList title="Following" users={following} emptyMessage="Not following anyone yet." />
          )}
        </div>
      </main>

      <aside className="user-aside">
        <Trending trending={trending} />
        <WhoToFollow users={usersToFollow} />
      </aside>

      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Profile"
        message="This action cannot be undone."
      />
    </div>
  );
};

export default UserPage;