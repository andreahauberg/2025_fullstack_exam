import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [repostPosts, setRepostPosts] = useState([]);
  const [isRepostsLoading, setIsRepostsLoading] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasMoreReposts, setHasMoreReposts] = useState(true);
  const repostPageRef = useRef(1);
  const repostLoadingRef = useRef(false);
  const repostHasMoreRef = useRef(true);
  const hasLoadedRepostsRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts"); // posts | reposts | followers | following
  const profileTitle = user?.user_username ? `${user.user_full_name || user.user_username} (@${user.user_username}) / X` : "Profile";
  useDocumentTitle(profileTitle);

  useEffect(() => {
    repostLoadingRef.current = isRepostsLoading;
  }, [isRepostsLoading]);

  useEffect(() => {
    repostHasMoreRef.current = hasMoreReposts;
  }, [hasMoreReposts]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserPk = localStorage.getItem("user_pk");

      const [userResp, trendingResp, usersToFollowResp] = await Promise.all([
        api.get(`/users/${username}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        token
          ? api.get("/trending", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: [] }),
        token
          ? api.get("/users-to-follow", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: [] }),
      ]);

      if (!userResp.data?.user) {
        navigate("/404", { replace: true, state: { missingUsername: username } });
        return;
      }
      setUser(userResp.data.user);
      setFollowers(userResp.data.followers);
      setFollowing(userResp.data.following);
      setTrending(trendingResp.data);
      setUsersToFollow(usersToFollowResp.data);

      if (token && currentUserPk) {
        setIsFollowing(userResp.data.followers.some((f) => f.user_pk === currentUserPk));
      }
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      const status = err.response?.status;
      const backendError = err.response?.data?.error || "";
      const backendMessage = err.response?.data?.message || "";
      const isMissingUser = status === 404 || backendError === "User not found." || backendMessage.includes("No query results") || backendMessage.includes("User not found");
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

  const fetchRepostPosts = useCallback(async () => {
    if (repostLoadingRef.current || !repostHasMoreRef.current) return;
    setIsRepostsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/users/${username}/reposts?page=${repostPageRef.current}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      const data = response.data.data ?? response.data ?? [];
      setRepostPosts((prev) => {
        const filtered = data.filter((p) => !prev.some((prevPost) => prevPost.post_pk === p.post_pk));
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

  useEffect(() => {
    fetchData();
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

      if (wasFollowing)
        await api.delete(`/follows/${user?.user_pk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      else await api.post("/follows", { followed_user_fk: user?.user_pk }, { headers: { Authorization: `Bearer ${token}` } });
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
      setError("Failed to update follow status.");
    }
  };

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
        <UserHeader user={user} isCurrentUser={false} onFollowToggle={handleFollowToggle} isFollowing={isFollowing} onDeleteProfile={() => setIsDeleteDialogOpen(true)} />
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
