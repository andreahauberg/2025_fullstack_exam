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

  const logoutAndRedirect = useCallback(() => {
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
      const token = localStorage.getItem("token");

      try {
        const resp = await api.get(`/posts?page=${requestedPage}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const newPosts = resp.data.data || [];
        setFeedError("");

        setPosts((prev) => {
          const unique = newPosts.filter(
            (p) => !prev.some((old) => old.post_pk === p.post_pk)
          );
          return [...prev, ...unique];
        });

        setHasMoreState(
          resp.data.current_page < resp.data.last_page
        );
      } catch (err) {
        const msg = parseApiErrorMessage(err, "Failed to load feed.");
        setFeedError(msg);

        if (err.response?.status === 401) logoutAndRedirect();
      } finally {
        setLoadingState(false);
      }
    },
    [logoutAndRedirect]
  );

  const fetchTrending = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
      const resp = await api.get("/trending", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTrending(resp.data || []);
      setTrendingError("");
    } catch (err) {
      const msg = parseApiErrorMessage(
        err,
        "Unable to load trending topics."
      );
      setTrendingError(msg);

      if (err.response?.status === 401) logoutAndRedirect();
    }
  }, [logoutAndRedirect]);

  const fetchUsersToFollow = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
      const resp = await api.get("/users-to-follow", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUsersToFollow(resp.data || []);
      setUsersError("");
    } catch (err) {
      const msg = parseApiErrorMessage(
        err,
        "Unable to load recommendations."
      );
      setUsersError(msg);

      if (err.response?.status === 401) logoutAndRedirect();
    }
  }, [logoutAndRedirect]);

  const initializeFeed = useCallback(() => {
    setPosts([]);
    setPage(1);
    setHasMoreState(true);
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      logoutAndRedirect();
      return;
    }

    fetchTrending();
    fetchUsersToFollow();
    initializeFeed();
  }, [fetchTrending, fetchUsersToFollow, initializeFeed, logoutAndRedirect]);

  useEffect(() => {
    if (page > 1) fetchPosts(page);
  }, [page, fetchPosts]);

  const loadNextPage = useCallback(() => {
    if (!loadingRef.current && hasMoreRef.current) {
      setPage((prev) => prev + 1);
    }
  }, []);

  const handlePostCreated = useCallback((post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const handleUpdatePost = useCallback((updated) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.post_pk === updated.post_pk
          ? { ...p, ...updated, user: updated.user ?? p.user }
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