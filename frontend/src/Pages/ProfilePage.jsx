import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import NavBar from "../components/NavBar";
import WhoToFollow from "../components/WhoToFollow";
import Trending from "../components/Trending";
import UserHeader from "../components/UserHeader";
import UserStats from "../components/UserStats";
import UserList from "../components/UserList";
import UserPosts from "../components/UserPosts";
import UserTabs from "../components/UserTabs";
import ConfirmationDialog from "../components/ConfirmationDialog";
import PostDialog from "../components/PostDialog";
import Post from "../components/Post";
import "../css/UserPage.css";
import {
  extractFieldErrors,
  parseApiErrorMessage,
  validateProfileUpdate,
} from "../utils/validation";
import LoadingOverlay from "../components/LoadingOverlay";
import { useDocumentTitle } from "../utils/useDocumentTitle";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [repostPosts, setRepostPosts] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isRepostsLoading, setIsRepostsLoading] = useState(false);
  const [hasMoreReposts, setHasMoreReposts] = useState(true);
  const repostPageRef = useRef(1);
  const repostLoadingRef = useRef(false);
  const repostHasMoreRef = useRef(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [latestPost, setLatestPost] = useState(null);
  const profileTitle = user?.user_username
    ? `${user.user_full_name || user.user_username} (@${user.user_username}) / X`
    : "Profile";
  useDocumentTitle(profileTitle);

  useEffect(() => {
    repostLoadingRef.current = isRepostsLoading;
  }, [isRepostsLoading]);

  useEffect(() => {
    repostHasMoreRef.current = hasMoreReposts;
  }, [hasMoreReposts]);

  const currentUserPk = localStorage.getItem("user_pk");
  const isCurrentUser =
    user?.user_pk !== undefined &&
    String(user.user_pk) === String(currentUserPk);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const [userResponse, trendingResponse, usersToFollowResponse] =
        await Promise.all([
          api.get(`/users/${username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/trending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/users-to-follow", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
      if (!userResponse.data?.user) {
        navigate("/404", { replace: true, state: { missingUsername: username } });
        return;
      }
      setUser(userResponse.data.user);
      setEditedUser(userResponse.data.user);
      setFollowers(userResponse.data.followers);
      setFollowing(userResponse.data.following);
      setIsFollowing(
        userResponse.data.followers?.some((f) => f.user_pk === currentUserPk) ||
          false
      );
      setTrending(trendingResponse.data);
      setUsersToFollow(usersToFollowResponse.data);
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
      const status = error.response?.status;
      const backendError = error.response?.data?.error || "";
      const backendMessage = error.response?.data?.message || "";
      const isMissingUser =
        status === 404 ||
        backendError === "User not found." ||
        backendMessage.includes("No query results") ||
        backendMessage.includes("User not found");
      if (isMissingUser) {
        setIsLoading(false);
        navigate("/404", { replace: true, state: { missingUsername: username } });
        return;
      }
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_pk");
        localStorage.removeItem("user_username");
        navigate("/");
        return;
      }
      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRepostPosts = async () => {
    if (repostLoadingRef.current || !repostHasMoreRef.current) return;
    setIsRepostsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(
        `/users/${username}/reposts?page=${repostPageRef.current}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data.data ?? response.data ?? [];
      setRepostPosts((prev) => {
        const filtered = data.filter(
          (p) => !prev.some((prevPost) => prevPost.post_pk === p.post_pk)
        );
        return [...prev, ...filtered];
      });
      const more = response.data.current_page < response.data.last_page;
      setHasMoreReposts(more);
      if (more) repostPageRef.current += 1;
    } catch (err) {
      console.error("Error fetching reposts:", err.response?.data || err.message);
      setRepostPosts([]);
      setHasMoreReposts(false);
    } finally {
      setIsRepostsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  useEffect(() => {
    setRepostPosts([]);
    setHasMoreReposts(true);
    repostPageRef.current = 1;
    repostHasMoreRef.current = true;
    repostLoadingRef.current = false;
    fetchRepostPosts();
    setLatestPost(null);
  }, [fetchRepostPosts, username]);

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

  const handleEdit = () => {
    setFormErrors({});
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const clientErrors = validateProfileUpdate(editedUser);
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/users/${user?.user_pk}`, editedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      setIsEditing(false);
      setFormErrors({});
    } catch (error) {
      const backendErrors = extractFieldErrors(error);
      if (Object.keys(backendErrors).length > 0) {
        setFormErrors(backendErrors);
      } else {
        setError(parseApiErrorMessage(error, "Failed to update user data."));
      }
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleFollowToggle = async () => {
    const currentUserPk = localStorage.getItem("user_pk");
    const currentUsername = localStorage.getItem("user_username");
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowers((prev) =>
      wasFollowing
        ? prev.filter((f) => String(f.user_pk) !== String(currentUserPk))
        : [
            ...prev,
            {
              user_pk: currentUserPk,
              user_username: currentUsername,
              user_full_name: currentUsername,
            },
          ]
    );

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      if (wasFollowing) {
        await api.delete(`/follows/${user?.user_pk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          "/follows",
          { followed_user_fk: user?.user_pk },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      setIsFollowing(wasFollowing);
      setFollowers((prev) =>
        wasFollowing
          ? [
              ...prev,
              {
                user_pk: currentUserPk,
                user_username: currentUsername,
                user_full_name: currentUsername,
              },
            ]
          : prev.filter((f) => String(f.user_pk) !== String(currentUserPk))
      );
      console.error("Error updating follow status:", err.response?.data || err.message);
      setError("Failed to update follow status.");
    }
  };

  const handleSidebarFollowChange = (isNowFollowing, targetUser) => {
    if (!targetUser?.user_pk) return;
    setFollowing((prev) => {
      if (isNowFollowing) {
        const exists = prev.some(
          (u) => String(u.user_pk) === String(targetUser.user_pk)
        );
        if (exists) return prev;
        return [
          ...prev,
          {
            user_pk: targetUser.user_pk,
            user_username: targetUser.user_username,
            user_full_name: targetUser.user_full_name,
          },
        ];
      }
      return prev.filter(
        (u) => String(u.user_pk) !== String(targetUser.user_pk)
      );
    });
  };

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
          setIsEditing={setIsEditing}
          isCurrentUser={isCurrentUser}
          onFollowToggle={handleFollowToggle}
          isFollowing={isFollowing}
          onDeleteProfile={() => setIsDeleteDialogOpen(true)}
        />
        <UserStats
          postsCount={user.posts_count || 0}
          followersCount={followers.length}
          followingCount={following.length}
        />
        <UserTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          followersCount={followers.length}
          followingCount={following.length}
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
              {!isRepostsLoading && repostPosts && repostPosts.length > 0
                ? repostPosts.map((post) => (
                    <Post
                      key={post.post_pk}
                      post={post}
                      onUpdatePost={handleUpdateRepostPost}
                      onDeletePost={null}
                      hideHeader={false}
                    />
                  ))
                : !isRepostsLoading && (
                    <p className="empty-message">No reposts yet.</p>
                  )}
            </>
          )}
          {activeTab === "followers" && (
            <UserList
              title="Followers"
              users={followers}
              emptyMessage="No followers yet."
            />
          )}
          {activeTab === "following" && (
            <UserList
              title="Following"
              users={following}
              emptyMessage="Not following anyone yet."
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
