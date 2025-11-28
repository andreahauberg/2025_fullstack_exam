import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import Post from "../components/Post";

const UserPosts = ({ userPk, isCurrentUser }) => {
  const [posts, setPosts] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(true);
  const [error, setError] = useState(null);

  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Opdater refs når state ændres
  useEffect(() => {
    loadingRef.current = loadingState;
  }, [loadingState]);
  useEffect(() => {
    hasMoreRef.current = hasMoreState;
  }, [hasMoreState]);

  // ----------------------------------------
  // Fetch posts
  // ----------------------------------------
const fetchPosts = async (requestedPage = pageRef.current) => {
  if (loadingRef.current || !hasMoreRef.current) return;

  setLoadingState(true);

  try {
    const response = await api.get(
      `/users/${userPk}/posts?page=${requestedPage}`
    );
    const newPosts = response.data.data ?? []; // <-- rettet

    setPosts((prev) => {
      const filtered = newPosts.filter(
        (post) => !prev.some((p) => p.post_pk === post.post_pk)
      );
      return [...prev, ...filtered];
    });

    const more = response.data.current_page < response.data.last_page; // <-- rettet
    setHasMoreState(more);

    if (more) pageRef.current += 1;
  } catch (err) {
    console.error("Error fetching posts:", err.response?.data ?? err.message);
    setError("Failed to load posts.");
  } finally {
    setLoadingState(false);
  }
};


  // ----------------------------------------
  // Initial load / reset ved ny bruger
  // ----------------------------------------
  useEffect(() => {
    setPosts([]);
    setHasMoreState(true);
    setLoadingState(false);
    pageRef.current = 1;
    fetchPosts(1);
  }, [userPk]);

  // ----------------------------------------
  // Infinite scroll
  // ----------------------------------------
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
  }, []);

  // ----------------------------------------
  // Post handlers
  // ----------------------------------------
  const handlePostCreated = (newPost) => {
    if (isCurrentUser) setPosts((prev) => [newPost, ...prev]);
  };

const handleUpdatePost = (updatedPost) => {
  setPosts((prev) =>
    prev.map((post) =>
      post.post_pk === updatedPost.post_pk
        ? { ...updatedPost, user: post.user } // behold user fra eksisterende post
        : post
    )
  );
};


  const handleDeletePost = (deletedPostPk) => {
    if (isCurrentUser)
      setPosts((prev) => prev.filter((post) => post.post_pk !== deletedPostPk));
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------
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
              hideHeader={!isCurrentUser}
            />
          ))}
          {loadingState && (
            <p className="loading-message">Loading more posts...</p>
          )}
        </>
      ) : (
        <p className="empty-message">No posts yet.</p>
      )}
    </div>
  );
};

export default UserPosts;
