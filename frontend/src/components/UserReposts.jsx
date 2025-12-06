import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api";
import Post from "../components/Post";

const UserReposts = ({ username, onUpdateRepost }) => {
  const [repostPosts, setRepostPosts] = useState([]);
  const [isRepostsLoading, setIsRepostsLoading] = useState(false);
  const [hasMoreReposts, setHasMoreReposts] = useState(true);
  const [error, setError] = useState(null);
  const repostPageRef = useRef(1);
  const repostLoadingRef = useRef(false);
  const repostHasMoreRef = useRef(true);

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
      console.error(
        "Error fetching reposts:",
        err.response?.data || err.message
      );
      setRepostPosts([]);
      setHasMoreReposts(false);
      setError("Failed to load reposts.");
    } finally {
      setIsRepostsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    setRepostPosts([]);
    setHasMoreReposts(true);
    repostPageRef.current = 1;
    repostHasMoreRef.current = true;
    repostLoadingRef.current = false;
    fetchRepostPosts();
  }, [username, fetchRepostPosts]);

  useEffect(() => {
    const handleScroll = () => {
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
  }, [fetchRepostPosts]);

  const handleRepostUpdate = (updatedPost) => {
    setRepostPosts((prev) => {
      const filtered = prev.filter((p) => p.post_pk !== updatedPost.post_pk);
      return updatedPost.is_reposted_by_user
        ? [updatedPost, ...filtered]
        : filtered;
    });

    if (onUpdateRepost) {
      onUpdateRepost(updatedPost);
    }
  };

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="user-reposts">
      <h3>Reposts</h3>
      {isRepostsLoading && (
        <p className="loading-message">Loading reposts...</p>
      )}

      {repostPosts.length > 0
        ? repostPosts.map((post) => (
            <Post
              key={post.post_pk}
              post={post}
              onUpdatePost={handleRepostUpdate}
              onDeletePost={null}
              hideHeader={false}
            />
          ))
        : !isRepostsLoading && <p className="empty-message">No reposts yet.</p>}
    </div>
  );
};

export default UserReposts;
