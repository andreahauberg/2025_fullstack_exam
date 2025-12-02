import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { parseApiErrorMessage } from "../utils/validation";

export const useHomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [feedError, setFeedError] = useState("");
  const [trendingError, setTrendingError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [page, setPage] = useState(1);
  const [loadingState, setLoadingState] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(true);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const navigate = useNavigate();

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_pk");
    localStorage.removeItem("user_username");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    loadingRef.current = loadingState;
  }, [loadingState]);

  useEffect(() => {
    hasMoreRef.current = hasMoreState;
  }, [hasMoreState]);

  const fetchPosts = useCallback(
    async (requestedPage) => {
      if (loadingRef.current || !hasMoreRef.current) return;
      setLoadingState(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/posts?page=${requestedPage}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const newPosts = response.data.data ?? [];
        setFeedError("");
        setPosts((prev) => {
          const filtered = newPosts.filter(
            (p) => !prev.some((prevP) => prevP.post_pk === p.post_pk)
          );
          return [...prev, ...filtered];
        });
        const more = response.data.current_page < response.data.last_page;
        setHasMoreState(more);
      } catch (err) {
        setFeedError(
          parseApiErrorMessage(err, "Failed to load feed. Please try again.")
        );
        if (err.response?.status === 401) {
          handleUnauthorized();
        }
      } finally {
        setLoadingState(false);
      }
    },
    [handleUnauthorized]
  );

  const fetchTrending = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/trending", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTrending(response.data);
      setTrendingError("");
    } catch (err) {
      setTrendingError(
        parseApiErrorMessage(err, "Unable to load trending topics right now.")
      );
      if (err.response?.status === 401) {
        handleUnauthorized();
      }
    }
  }, [handleUnauthorized]);

  const fetchUsersToFollow = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/users-to-follow", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUsersToFollow(response.data);
      setUsersError("");
    } catch (err) {
      setUsersError(
        parseApiErrorMessage(err, "Unable to load recommendations right now.")
      );
      if (err.response?.status === 401) {
        handleUnauthorized();
      }
    }
  }, [handleUnauthorized]);

  const initializeFeed = useCallback(() => {
    setPosts([]);
    setHasMoreState(true);
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleUnauthorized();
      return;
    }
    fetchTrending();
    fetchUsersToFollow();
    initializeFeed();
  }, [fetchTrending, fetchUsersToFollow, handleUnauthorized, initializeFeed]);

  useEffect(() => {
    if (page === 1) return;
    fetchPosts(page);
  }, [page, fetchPosts]);

  const loadNextPage = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return;
    setPage((prev) => prev + 1);
  }, []);

  const handlePostCreated = useCallback((newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const handleUpdatePost = useCallback((updatedPost) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.post_pk === updatedPost.post_pk
          ? { ...p, ...updatedPost, user: updatedPost.user ?? p.user }
          : p
      )
    );
  }, []);

  const handleDeletePost = useCallback((postPk) => {
    setPosts((prev) => prev.filter((p) => p.post_pk !== postPk));
  }, []);

  return {
    posts,
    trending,
    usersToFollow,
    feedError,
    trendingError,
    usersError,
    loadingState,
    hasMoreState,
    loadNextPage,
    handlePostCreated,
    handleUpdatePost,
    handleDeletePost,
  };
};
