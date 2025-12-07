import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../api";
import { parseApiErrorMessage } from "../utils/validation";

export const useHomeFeed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // ---------------- POSTS ----------------
  const {
    data: postsPages,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching, // <--- her
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

  // ---------------- TRENDING ----------------
  const {
    data: trendingData,
    error: trendingError,
    isFetching: trendingLoading,
  } = useQuery({
    queryKey: ["trending"],
    queryFn: async () => {
      try {
        const response = await api.get("/trending", { headers: authHeaders() });
        return response.data;
      } catch (err) {
        if (err.response?.status === 401) handleUnauthorized();
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const trending = trendingData ?? [];

  // ---------------- USERS TO FOLLOW ----------------
  const {
    data: usersFollowData,
    error: usersError,
    isFetching: usersLoading,
  } = useQuery({
    queryKey: ["usersToFollow"],
    queryFn: async () => {
      try {
        const response = await api.get("/users-to-follow", {
          headers: authHeaders(),
        });
        return response.data;
      } catch (err) {
        if (err.response?.status === 401) handleUnauthorized();
        throw err;
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const usersToFollow = usersFollowData ?? [];

  // ---------------- OPTIMISTIC UPDATES ----------------
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

  // ---------------- RETURN ----------------
  return {
    posts,
    feedError: postsError ? parseApiErrorMessage(postsError) : "",
    loadingState: isFetching && !isFetchingNextPage, // <-- første load spinner
    loadNextPage: fetchNextPage,
    hasMoreState: hasNextPage,
    isFetchingNextPage,

    trending,
    trendingError: trendingError ? parseApiErrorMessage(trendingError) : "",
    trendingLoadingState: trendingLoading,

    usersToFollow,
    usersError: usersError ? parseApiErrorMessage(usersError) : "",
    usersLoadingState: usersLoading,

    handlePostCreated,
    handleUpdatePost,
    handleDeletePost,
  };
};
