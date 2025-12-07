import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "../api";
import NavBar from "../components/NavBar";
import WhoToFollow from "../components/WhoToFollow";
import Trending from "../components/Trending";
import UserHeader from "../components/UserHeader";
import UserList from "../components/UserList";
import UserPosts from "../components/UserPosts";
import UserReposts from "../components/UserReposts";
import UserTabs from "../components/UserTabs";
import ConfirmationDialog from "../components/ConfirmationDialog";
import PostDialog from "../components/PostDialog";
import LoadingOverlay from "../components/LoadingOverlay";
import "../css/UserPage.css";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useFollowActions } from "../hooks/useFollowActions";
import { useProfileData } from "../hooks/useProfileData";
import { useProfileEditing } from "../hooks/useProfileEditing";
import { useAsideData } from "../hooks/useAsideData"; // Beholdes for Trending

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const handleProfileUpdateSuccess = useCallback(() => {
    navigate("/home");
  }, [navigate]);

  // ---- Primær profil data ----
  const {
    posts,
    user,
    setUser,
    followers,
    setFollowers,
    following,
    setFollowing,
    isFollowing,
    setIsFollowing,
    isLoading,
    loadingState: postsLoadingState,
    error,
    setError,
    usersToFollow, // Tilføjet fra den gamle struktur
    usersToFollowLoading, // Tilføjet fra den gamle struktur
  } = useProfileData(username);

  // ---- Aside data (kun til Trending) ----
  const { trending, trendingError, trendingLoadingState } = useAsideData();

  const {
    isEditing,
    editedUser,
    formErrors,
    handleChange,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
  } = useProfileEditing(user, setUser, setError, handleProfileUpdateSuccess);

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [latestPost, setLatestPost] = useState(null);

  const currentUserPk = localStorage.getItem("user_pk");
  const isCurrentUser =
    user?.user_pk !== undefined &&
    String(user.user_pk) === String(currentUserPk);

  const profileTitle = user?.user_username
    ? `${user.user_full_name || user.user_username} (@${
        user.user_username
      }) / Weave`
    : "Profile";
  useDocumentTitle(profileTitle);

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
        } catch {
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

  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${user?.user_pk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user_pk");
      localStorage.removeItem("user_username");
      navigate("/");
    } catch {
      setError("Failed to delete profile.");
    }
  };

  if (error) return <p className="error">{error}</p>;

  const handleUpdateRepost = (updatedPost) => {
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
      prev ? { ...prev, posts_count: Number(prev.posts_count || 0) + 1 } : prev
    );
  };

  const navBarLoading = postsLoadingState && posts.length === 0;

  return (
    <div data-testid="profile-page">
      <div id="container">
        <NavBar
          setIsPostDialogOpen={setIsPostDialogOpen}
          isLoading={navBarLoading}
        />
        <main className="user-main">
          {isLoading ? (
            <LoadingOverlay message="Loading profile..." />
          ) : !user ? (
            <p className="error">User not found.</p>
          ) : (
            <>
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
                    onUpdateRepost={handleUpdateRepost}
                  />
                )}
                {activeTab === "reposts" && (
                  <UserReposts
                    username={username}
                    onUpdateRepost={handleUpdateRepost}
                  />
                )}
                {activeTab === "followers" && (
                  <UserList
                    title="Followers"
                    users={followers}
                    emptyMessage="No followers yet."
                    onFollowChange={handleSidebarFollowChange}
                  />
                )}
                {activeTab === "following" && (
                  <UserList
                    title="Following"
                    users={following}
                    emptyMessage="Not following anyone yet."
                    onFollowChange={handleSidebarFollowChange}
                  />
                )}
              </div>
            </>
          )}
        </main>
        <aside className="user-aside">
          <Trending
            trending={trending}
            isLoading={trendingLoadingState}
            error={trendingError}
          />
          <WhoToFollow
            users={usersToFollow}
            isLoading={usersToFollowLoading}
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
    </div>
  );
};

export default ProfilePage;
