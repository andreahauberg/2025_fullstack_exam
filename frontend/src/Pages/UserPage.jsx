import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
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
    usersToFollowLoading,
    trendingLoading,
  } = useProfileData(username, { requireAuth: false });

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

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

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

  if (error) return <p className="error">{error}</p>;

  const handleUpdateRepost = (updatedPost) => {
    setUser((prev) => ({
      ...prev,
      reposts_count: updatedPost.is_reposted_by_user
        ? Number(prev.reposts_count || 0) + 1
        : Math.max(0, Number(prev.reposts_count || 0) - 1),
    }));
  };

  const isAnyLoading = trendingLoading || usersToFollowLoading;

  return (
    <div data-testid="user-page">
      <div id="container">
        <NavBar
          setIsPostDialogOpen={setIsPostDialogOpen}
          isLoading={isAnyLoading}
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
                isCurrentUser={false}
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
                  <UserPosts userPk={user?.user_pk} isCurrentUser={false} />
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
          <Trending trending={trending} isLoading={trendingLoading} />
          <WhoToFollow
            users={usersToFollow}
            isLoading={usersToFollowLoading}
            onFollowChange={handleSidebarFollowChange}
          />
        </aside>
        <PostDialog
          isOpen={isPostDialogOpen}
          onClose={() => setIsPostDialogOpen(false)}
          onSuccess={(newPost) => {}}
        />
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          title="Delete Profile"
          message="Are you sure you want to delete your profile? This action cannot be undone."
        />
      </div>
    </div>
  );
};

export default UserPage;
