import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { parseApiErrorMessage } from "../utils/validation";
import { useAsideData } from "./useAsideData"; // Beholdes for Trending

export const useHomeFeed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ---- Trending (bruger useAsideData) ----
  const { trending, trendingError, trendingLoadingState } = useAsideData();

  // ---- WhoToFollow (gammel logik) ----
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [usersError, setUsersError] = useState("");
  const [usersLoadingState, setUsersLoadingState] = useState(false);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_pk");
    localStorage.removeItem("user_username");
    navigate("/");
  }, [navigate]);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ---- Hent WhoToFollow (gammel logik) ----
  const fetchUsersToFollow = useCallback(async () => {
    setUsersLoadingState(true);
    try {
      const response = await api.get("/users-to-follow", {
        headers: authHeaders(),
      });
      setUsersToFollow(response.data);
      setUsersError("");
    } catch (err) {
      setUsersError(
        parseApiErrorMessage(err, "Unable to load recommendations right now.")
      );
      if (err.response?.status === 401) handleUnauthorized();
    } finally {
      setUsersLoadingState(false);
    }
  }, [handleUnauthorized]);

  // ---- Posts (ny logik) ----
  const {
    data: postsPages,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    status: postsStatus,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await api.get(`/posts?page=${pageParam}`, {
          headers: authHeaders(),
        });
        return response.data;
      } catch (err) {
        if (err.response?.status === 401) handleUnauthorized();
        throw err;
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page
        ? lastPage.current_page + 1
        : undefined,
    staleTime: 1000 * 60 * 1,
    retry: 2,
  });

  const posts = postsPages?.pages.flatMap((page) => page.data || []) ?? [];

  // ---- Optimistic Updates ----
  const handlePostCreated = useCallback(
    (newPost) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          data: [newPost, ...(newPages[0].data || [])],
        };
        return { ...old, pages: newPages };
      });
    },
    [queryClient]
  );

  const handleUpdatePost = useCallback(
    (updatedPost) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.map((p) =>
            p.post_pk === updatedPost.post_pk
              ? { ...p, ...updatedPost, user: updatedPost.user ?? p.user }
              : p
          ),
        }));
        return { ...old, pages: newPages };
      });
    },
    [queryClient]
  );

  const handleDeletePost = useCallback(
    (postPk) => {
      queryClient.setQueryData(["posts"], (old) => {
        if (!old) return old;
        const newPages = old.pages.map((page) => ({
          ...page,
          data: page.data.filter((p) => p.post_pk !== postPk),
        }));
        return { ...old, pages: newPages };
      });
    },
    [queryClient]
  );

  // ---- Initialiser WhoToFollow ----
  useEffect(() => {
    fetchUsersToFollow();
  }, [fetchUsersToFollow]);

  // ---- Return ----
  return {
    // feed
    posts,
    feedError: postsError ? parseApiErrorMessage(postsError) : "",
    loadingState: isFetching && !isFetchingNextPage,
    loadNextPage: fetchNextPage,
    hasMoreState: hasNextPage,
    isFetchingNextPage,
    // aside
    trending,
    trendingError,
    trendingLoadingState,
    usersToFollow,
    usersError,
    usersLoadingState,
    // optimistic updates
    handlePostCreated,
    handleUpdatePost,
    handleDeletePost,
  };
};
