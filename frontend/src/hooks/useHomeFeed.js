import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { parseApiErrorMessage } from "../utils/validation";
import { useAuth } from "../hooks/useAuth";

export const useHomeFeed = ({ enabled = true } = {}) => {
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

  const { logout } = useAuth();
  const handleUnauthorized = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  useEffect(() => {
    loadingRef.current = loadingState;
  }, [loadingState]);

  useEffect(() => {
    hasMoreRef.current = hasMoreState;
  }, [hasMoreState]);

  const fetchPosts = useCallback(
    async (requestedPage) => {
      if (!enabled) return;
      if (loadingRef.current || !hasMoreRef.current) return;

      setLoadingState(true);
      try {
        const response = await api.get(`/posts?page=${requestedPage}`);

        const newPosts = response.data.data ?? [];
        setFeedError("");

        setPosts((prev) => {
          const filtered = newPosts.filter(
            (p) => !prev.some((old) => old.post_pk === p.post_pk)
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
    [handleUnauthorized, enabled]
  );

  const fetchTrending = useCallback(async () => {
    if (!enabled) return;
    try {
      const response = await api.get("/trending");
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
  }, [handleUnauthorized, enabled]);

  const fetchUsersToFollow = useCallback(async () => {
    if (!enabled) return;
    try {
      const response = await api.get("/users-to-follow");
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
  }, [handleUnauthorized, enabled]);

  const initializeFeed = useCallback(() => {
    if (!enabled) return;
    setPosts([]);
    setHasMoreState(true);
    setPage(1);
    fetchPosts(1);
  }, [fetchPosts, enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetchTrending();
    fetchUsersToFollow();
    initializeFeed();
  }, [fetchTrending, fetchUsersToFollow, initializeFeed, enabled]);

  useEffect(() => {
    if (page === 1) return;
    if (!enabled) return;
    fetchPosts(page);
  }, [page, fetchPosts, enabled]);

  const loadNextPage = useCallback(() => {
    if (!enabled || loadingRef.current || !hasMoreRef.current) return;
    setPage((prev) => prev + 1);
  }, [enabled]);

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
