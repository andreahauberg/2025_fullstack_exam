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
import { useAuth } from "../hooks/useAuth";

const UserPage = () => {
  const { username } = useParams();
  const {
    user,
    setUser,
    followers,
    setFollowers,
    following,
    setFollowing,
    usersToFollow,
    trending,
    isFollowing,
    setIsFollowing,
    isLoading,
    error,
    setError,
  } = useProfileData(username, { requireAuth: false });
  const { user: authUser, logout } = useAuth();

  const { handleFollowToggle } = useFollowActions({
    user,
    setUser,
    followers,
    setFollowers,
    following,
    setFollowing,
    isFollowing,
    setIsFollowing,
    setError,
    currentUser: authUser,
    onUnauthenticated: logout,
  });
  const [repostPosts, setRepostPosts] = useState([]);
  const [isRepostsLoading, setIsRepostsLoading] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasMoreReposts, setHasMoreReposts] = useState(true);
  const repostPageRef = useRef(1);
  const repostLoadingRef = useRef(false);
  const repostHasMoreRef = useRef(true);
  const hasLoadedRepostsRef = useRef(false);
  const [activeTab, setActiveTab] = useState("posts"); // posts | reposts | followers | following
  const profileTitle = user?.user_username ? `${user.user_full_name || user.user_username} (@${user.user_username}) / Weave` : "Profile";
  useDocumentTitle(profileTitle);

  useEffect(() => {
    repostLoadingRef.current = isRepostsLoading;
  }, [isRepostsLoading]);

  useEffect(() => {
    repostHasMoreRef.current = hasMoreReposts;
  }, [hasMoreReposts]);

  const fetchRepostPosts = useCallback(async () => {
    if (repostLoadingRef.current || !repostHasMoreRef.current) return;
  
    setIsRepostsLoading(true);
  
    try {
      const response = await api.get(`/users/${username}/reposts?page=${repostPageRef.current}`);
  
      const data = response.data.data ?? response.data ?? [];
  
      setRepostPosts((prev) => {
        const filtered = data.filter((p) => 
          !prev.some((prevPost) => prevPost.post_pk === p.post_pk)
        );
        return [...prev, ...filtered];
      });
  
      const more = response.data.current_page < response.data.last_page;
      setHasMoreReposts(more);
      if (more) repostPageRef.current += 1;
  
      hasLoadedRepostsRef.current = true;
  
    } catch (err) {
      console.error("Error fetching reposts:", err.response?.data || err.message);
      setRepostPosts([]);
      setHasMoreReposts(false);
    } finally {
      setIsRepostsLoading(false);
    }
  }, [username]);

  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;
    const id = hash.replace("#", "");
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (e) {
          el.scrollIntoView();
        }
        return;
      }
      if (attempts < 6) {
        attempts += 1;
        setTimeout(tryScroll, 300);
      }
    };
    setTimeout(tryScroll, 50);
  }, [user, location.hash]);

  useEffect(() => {
    // Reset repost paging on user change
    setRepostPosts([]);
    setHasMoreReposts(true);
    repostPageRef.current = 1;
    repostHasMoreRef.current = true;
    repostLoadingRef.current = false;
    hasLoadedRepostsRef.current = false;
    if (activeTab === "reposts") fetchRepostPosts();
  }, [username, activeTab, fetchRepostPosts]);

  useEffect(() => {
    if (activeTab !== "reposts") return;
    if (hasLoadedRepostsRef.current) return;
    fetchRepostPosts();
  }, [activeTab, fetchRepostPosts]);

  useEffect(() => {
    const handleRepostsUpdate = (event) => {
      const updatedPost = event.detail?.post;
      if (!updatedPost?.post_pk) return;
      setRepostPosts((prev) => {
        const filtered = (prev || []).filter((p) => p.post_pk !== updatedPost.post_pk);
        return updatedPost.is_reposted_by_user ? [updatedPost, ...filtered] : filtered;
      });
    };
    window.addEventListener("reposts-updated", handleRepostsUpdate);
    return () => window.removeEventListener("reposts-updated", handleRepostsUpdate);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== "reposts") return;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 300 && !repostLoadingRef.current && repostHasMoreRef.current) {
        fetchRepostPosts();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  if (isLoading) return <LoadingOverlay message="Loading profile..." />;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="error">User not found.</p>;

  const handleUpdateRepostPost = (updatedPost) => {
    setRepostPosts((prev) => (prev || []).map((p) => (p.post_pk === updatedPost.post_pk ? { ...p, ...updatedPost } : p)));
  };

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />
      <main className="user-main">
        <UserHeader
          user={user}
          setUser={setUser}
          isCurrentUser={false}
          onFollowToggle={handleFollowToggle}
          isFollowing={isFollowing}
          onDeleteProfile={() => setIsDeleteDialogOpen(true)}
        />
        <UserTabs activeTab={activeTab} setActiveTab={setActiveTab} followersCount={followers.length} followingCount={following.length} postsCount={user.posts_count || 0} repostCount={user.reposts_count || 0} />

        <div className="user-tab-panels">
          {activeTab === "posts" && <UserPosts userPk={user?.user_pk} isCurrentUser={false} />}
          {activeTab === "reposts" && (
            <>
              {isRepostsLoading && <p className="loading-message">Loading reposts...</p>}
              {!isRepostsLoading && repostPosts && repostPosts.length > 0 ? repostPosts.map((post) => <Post key={post.post_pk} post={post} onUpdatePost={handleUpdateRepostPost} onDeletePost={null} hideHeader={false} />) : !isRepostsLoading && <p className="empty-message">No reposts yet.</p>}
            </>
          )}
          {activeTab === "followers" && <UserList title="Followers" users={followers} emptyMessage="No followers yet." />}
          {activeTab === "following" && <UserList title="Following" users={following} emptyMessage="Not following anyone yet." />}
        </div>
      </main>
      <aside className="user-aside">
        <Trending trending={trending} />
        <WhoToFollow users={usersToFollow} />
      </aside>
      <PostDialog isOpen={isPostDialogOpen} onClose={() => setIsPostDialogOpen(false)} onSuccess={(newPost) => {}} />
      <ConfirmationDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} title="Delete Profile" message="Are you sure you want to delete your profile? This action cannot be undone." />
    </div>
  );
};

export default UserPage;
