import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import Post from "../components/Post";

const UserPosts = ({ userPk, isCurrentUser, newPost }) => {
  const [posts, setPosts] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(true);
  const [error, setError] = useState(null);

  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    loadingRef.current = loadingState;
  }, [loadingState]);
  useEffect(() => {
    hasMoreRef.current = hasMoreState;
  }, [hasMoreState]);

  const fetchPosts = async (requestedPage = pageRef.current) => {
    if (loadingRef.current || !hasMoreRef.current) return;

    setLoadingState(true);

    try {
      const response = await api.get(
        `/users/${userPk}/posts?page=${requestedPage}`
      );
      const newPosts = response.data.data ?? [];

      setPosts((prev) => {
        const filtered = newPosts.filter(
          (post) => !prev.some((p) => p.post_pk === post.post_pk)
        );
        return [...prev, ...filtered];
      });

      const more = response.data.current_page < response.data.last_page;
      setHasMoreState(more);

      if (more) pageRef.current += 1;
    } catch (err) {
      console.error("Error fetching posts:", err.response?.data ?? err.message);
      setError("Failed to load posts.");
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    setPosts([]);
    setHasMoreState(true);
    setLoadingState(false);
    pageRef.current = 1;
    fetchPosts(1);
  }, [userPk]);

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
        !loadingRef.current &&
        hasMoreRef.current
      ) {
        fetchPosts();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  useEffect(() => {
    if (!isCurrentUser || !newPost?.post_pk) return;
    setPosts((prev) => {
      const exists = prev.some((post) => post.post_pk === newPost.post_pk);
      if (exists) return prev;
      return [newPost, ...prev];
    });
  }, [newPost, isCurrentUser]);

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.post_pk === updatedPost.post_pk
          ? { ...updatedPost, user: post.user }
          : post
      )
    );
  };

  const handleDeletePost = (deletedPostPk) => {
    if (isCurrentUser)
      setPosts((prev) => prev.filter((post) => post.post_pk !== deletedPostPk));
  };

  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="user-posts">
      <h3>Posts</h3>
      {posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <Post
              key={post.post_pk}
              post={post}
              onUpdatePost={handleUpdatePost}
              onDeletePost={isCurrentUser ? handleDeletePost : null}
              hideHeader={true}
            />
          ))}
        </>
      ) : (
        <p className="empty-message">No posts yet.</p>
      )}
    </div>
  );
};

export default UserPosts;
