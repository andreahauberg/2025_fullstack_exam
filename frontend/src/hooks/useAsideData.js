import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { parseApiErrorMessage } from "../utils/validation";

export const useAsideData = () => {
  const navigate = useNavigate();

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

  return {
    trending,
    trendingError: trendingError ? parseApiErrorMessage(trendingError) : "",
    trendingLoadingState: trendingLoading,

    usersToFollow,
    usersError: usersError ? parseApiErrorMessage(usersError) : "",
    usersLoadingState: usersLoading,
  };
};
