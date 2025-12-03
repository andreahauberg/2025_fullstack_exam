import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../api";
import NavBar from "../components/NavBar";
import WhoToFollow from "../components/WhoToFollow";
import Trending from "../components/Trending";
import UserHeader from "../components/UserHeader";
import UserList from "../components/UserList";
import UserPosts from "../components/UserPosts";
import UserTabs from "../components/UserTabs";
import ConfirmationDialog from "../components/ConfirmationDialog";
import PostDialog from "../components/PostDialog";
import Post from "../components/Post";
import "../css/UserPage.css";
import LoadingOverlay from "../components/LoadingOverlay";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useFollowActions } from "../hooks/useFollowActions";
import { useProfileData } from "../hooks/useProfileData";
import { useProfileEditing } from "../hooks/useProfileEditing";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
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
  } = useProfileData(username);

  const {
    isEditing,
    editedUser,
    formErrors,
    handleChange,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
  } = useProfileEditing(user, setUser, setError);

  const { handleFollowToggle, handleSidebarFollowChange } = useFollowActions({
    user,
    setUser,
    followers,
    setFollowers,
    following,
    setFollowing,
    isFollowing,
    setIsFollowing,
    setError,
  });

  const [repostPosts, setRepostPosts] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isRepostsLoading, setIsRepostsLoading] = useState(false);
  const [hasMoreReposts, setHasMoreReposts] = useState(true);
  const repostPageRef = useRef(1);
  const repostLoadingRef = useRef(false);
  const repostHasMoreRef = useRef(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [latestPost, setLatestPost] = useState(null);

  const profileTitle = user?.user_username
    ? `${user.user_full_name || user.user_username} (@${user.user_username}) / Weave`
    : "Profile";

  useDocumentTitle(profileTitle);

  const currentUserPk = localStorage.getItem("user_pk");
  const isCurrentUser =
    user?.user_pk !== undefined &&
    String(user.user_pk) === String(currentUserPk);

  const fetchRepostPosts = useCallback(async () => {
    if (repostLoadingRef.current || !repostHasMoreRef.current) return;

    setIsRepostsLoading(true);
    repostLoadingRef.current = true;

    try {
      const response = await api.get(
        `/users/${username}/reposts?page=${repostPageRef.current}`
      );

      const data = response.data.data ?? response.data ?? [];

      setRepostPosts((prev) => {
        const unique = data.filter(
          (p) => !prev.some((prevP) => prevP.post_pk === p.post_pk)
        );
        return [...prev, ...unique];
      });

      const more = response.data.current_page < response.data.last_page;
      setHasMoreReposts(more);
      repostHasMoreRef.current = more;

      if (more) repostPageRef.current += 1;
    } catch (err) {
      console.error("Error fetching reposts:", err.response?.data || err.message);
      setRepostPosts([]);
      setHasMoreReposts(false);
      repostHasMoreRef.current = false;
    } finally {
      setIsRepostsLoading(false);
      repostLoadingRef.current = false;
    }
  }, [username]);


  useEffect(() => {
    setRepostPosts([]);
    setHasMoreReposts(true);
    repostPageRef.current = 1;
    repostHasMoreRef.current = true;
    repostLoadingRef.current = false;

    if (activeTab === "reposts") {
      fetchRepostPosts();
    }
  }, [username, activeTab, fetchRepostPosts]);

  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== "reposts") return;

      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight;

      if (
        scrollTop + clientHeight >= scrollHeight - 300 &&
        !repostLoadingRef.current &&
        repostHasMoreRef.current
      ) {
        fetchRepostPosts();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, fetchRepostPosts]);

  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const id = hash.replace("#", "");
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (attempts < 6) {
        attempts += 1;
        setTimeout(tryScroll, 300);
      }
    };

    setTimeout(tryScroll, 50);
  }, [user, location.hash]);

  const handleDeleteProfile = async () => {
    try {
      await api.delete(`/users/${user?.user_pk}`);
      localStorage.clear();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error deleting profile:", error);
      setError("Failed to delete profile.");
    }
  };

  if (isLoading) return <LoadingOverlay message="Loading profile..." />;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="error">User not found.</p>;

  const handleUpdateRepostPost = (updatedPost) => {
    setRepostPosts((prev) =>
      (prev || []).map((p) =>
        p.post_pk === updatedPost.post_pk ? { ...p, ...updatedPost } : p
      )
    );

    setUser((prev) => ({
      ...prev,
      reposts_count: updatedPost.is_reposted_by_user
        ? Number(prev.reposts_count || 0) + 1
        : Math.max(0, Number(prev.reposts_count || 0) - 1),
    }));
  };

  const handlePostCreated = (newPost) => {
    if (!newPost?.post_pk || !isCurrentUser) return;
    setLatestPost(newPost);

    setUser((prev) =>
      prev
        ? { ...prev, posts_count: Number(prev.posts_count || 0) + 1 }
        : prev
    );
  };

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />

      <main className="user-main">
        <UserHeader
          user={user}
          setUser={setUser}
          isEditing={isEditing}
          editedUser={editedUser}
          formErrors={formErrors}
          handleChange={handleChange}
          handleEdit={handleEdit}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          isCurrentUser={isCurrentUser}
          onFollowToggle={handleFollowToggle}
          isFollowing={isFollowing}
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
            <UserPosts
              userPk={user?.user_pk}
              isCurrentUser={isCurrentUser}
              newPost={latestPost}
            />
          )}

          {activeTab === "reposts" && (
            <>
              {isRepostsLoading && (
                <p className="loading-message">Loading reposts...</p>
              )}
              {!isRepostsLoading && repostPosts.length > 0 ? (
                repostPosts.map((post) => (
                  <Post
                    key={post.post_pk}
                    post={post}
                    onUpdatePost={handleUpdateRepostPost}
                    onDeletePost={null}
                    hideHeader={false}
                  />
                ))
              ) : (
                !isRepostsLoading && (
                  <p className="empty-message">No reposts yet.</p>
                )
              )}
            </>
          )}

          {activeTab === "followers" && (
            <UserList
              title="Followers"
              users={followers}
              emptyMessage="No followers yet."
              onFollowChange={handleSidebarFollowChange}
              setUser={setUser}
            />
          )}

          {activeTab === "following" && (
            <UserList
              title="Following"
              users={following}
              emptyMessage="Not following anyone yet."
              onFollowChange={handleSidebarFollowChange}
              setUser={setUser}
            />
          )}
        </div>
      </main>

      <aside className="user-aside">
        <Trending trending={trending} />
        <WhoToFollow
          users={usersToFollow}
          onFollowChange={handleSidebarFollowChange}
        />
      </aside>

      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSuccess={handlePostCreated}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProfile}
        title="Delete Profile"
        message="Are you sure you want to delete your profile? This action cannot be undone."
      />
    </div>
  );
};

export default ProfilePage;