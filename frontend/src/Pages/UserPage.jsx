import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import NavBar from "../components/NavBar";
import WhoToFollow from "../components/WhoToFollow";
import Trending from "../components/Trending";
import UserHeader from "../components/UserHeader";
import UserStats from "../components/UserStats";
import UserList from "../components/UserList";
import UserPosts from "../components/UserPosts";
import Post from "../components/Post";
import LoadingOverlay from "../components/LoadingOverlay";
import "../css/UserPage.css";

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
  const [hasMoreReposts, setHasMoreReposts] = useState(true);
  const repostPageRef = useRef(1);
  const repostLoadingRef = useRef(false);
  const repostHasMoreRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts"); // posts | reposts | followers | following

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
        api.get(
          `/users/${username}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        ),
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

      setUser(userResp.data.user);
      setFollowers(userResp.data.followers);
      setFollowing(userResp.data.following);
      setTrending(trendingResp.data);
      setUsersToFollow(usersToFollowResp.data);

      if (token && currentUserPk) {
        setIsFollowing(
          userResp.data.followers.some((f) => f.user_pk === currentUserPk)
        );
      }
      setError(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
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
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
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
    // Reset repost paging on user change
    setRepostPosts([]);
    setHasMoreReposts(true);
    repostPageRef.current = 1;
    repostHasMoreRef.current = true;
    repostLoadingRef.current = false;
    fetchRepostPosts();
  }, [username]);

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
  }, [activeTab]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (isFollowing)
        await api.delete(`/follows/${user?.user_pk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      else
        await api.post(
          "/follows",
          { followed_user_fk: user?.user_pk },
          { headers: { Authorization: `Bearer ${token}` } }
        );

      setIsFollowing((prev) => !prev);
      // Avoid full refetch to prevent layout jump; adjust follower list locally
      setFollowers((prev) => {
        if (isFollowing) {
          return prev.filter((f) => f.user_pk !== localStorage.getItem("user_pk"));
        }
        const currentUserPk = localStorage.getItem("user_pk");
        return [...prev, { user_pk: currentUserPk }];
      });
    } catch (err) {
      setError("Failed to update follow status.");
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

  return (
    <div id="container">
      <NavBar />
      <main className="user-main">
        <UserHeader
          user={user}
          isCurrentUser={false}
          onFollowToggle={handleFollowToggle}
          isFollowing={isFollowing}
        />
        <UserStats
          postsCount={user.posts_count || 0}
          followersCount={followers.length}
          followingCount={following.length}
        />
        <div className="user-tabs" role="tablist" aria-label="Profile content">
          <button
            className={`user-tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
            role="tab"
          aria-selected={activeTab === "posts"}>
          Posts
          </button>
          <button
            className={`user-tab ${activeTab === "reposts" ? "active" : ""}`}
            onClick={() => setActiveTab("reposts")}
            role="tab"
            aria-selected={activeTab === "reposts"}>
            Reposts
          </button>
          <button
            className={`user-tab ${activeTab === "followers" ? "active" : ""}`}
            onClick={() => setActiveTab("followers")}
            role="tab"
            aria-selected={activeTab === "followers"}>
            Followers ({followers.length})
          </button>
          <button
            className={`user-tab ${activeTab === "following" ? "active" : ""}`}
            onClick={() => setActiveTab("following")}
            role="tab"
            aria-selected={activeTab === "following"}>
            Following ({following.length})
          </button>
        </div>
        <div className="user-tab-panels">
          {activeTab === "posts" && (
            <UserPosts userPk={user?.user_pk} isCurrentUser={false} />
          )}
          {activeTab === "reposts" && (
            <>
              {isRepostsLoading && <p className="loading-message">Loading reposts...</p>}
              {!isRepostsLoading && repostPosts && repostPosts.length > 0 ? (
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
                !isRepostsLoading && <p className="empty-message">No reposts yet.</p>
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
        <WhoToFollow users={usersToFollow} />
      </aside>
    </div>
  );
};

export default UserPage;
