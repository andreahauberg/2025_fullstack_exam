import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export const useProfileData = (username, options = {}) => {
  const { requireAuth = true } = options;
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usersToFollowLoading, setUsersToFollowLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setUsersToFollowLoading(true);
    setTrendingLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (requireAuth && !token) {
        setIsLoading(false);
        setUsersToFollowLoading(false);
        setTrendingLoading(false);
        navigate("/");
        return;
      }
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const userResponse = await api.get(`/users/${username}`, config);

      if (!userResponse.data?.user) {
        setIsLoading(false);
        setUsersToFollowLoading(false);
        setTrendingLoading(false);
        navigate("/404", {
          replace: true,
          state: { missingUsername: username },
        });
        return;
      }

      let trendingResponse = { data: [] };
      let usersToFollowResponse = { data: [] };

      if (token) {
        trendingResponse = await api.get("/trending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        usersToFollowResponse = await api.get("/users-to-follow", {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const currentUserPk = localStorage.getItem("user_pk");
      setUser(userResponse.data.user);
      setFollowers(userResponse.data.followers || []);
      setFollowing(userResponse.data.following || []);
      setTrending(trendingResponse.data || []);
      setUsersToFollow(usersToFollowResponse.data || []);
      setIsFollowing(
        currentUserPk
          ? userResponse.data.followers?.some(
              (f) => String(f.user_pk) === String(currentUserPk)
            ) || false
          : false
      );
    } catch (err) {
      const status = err.response?.status;
      const backendError = err.response?.data?.error || "";
      const backendMessage = err.response?.data?.message || "";
      const isMissingUser =
        status === 404 ||
        backendError === "User not found." ||
        backendMessage.includes("No query results") ||
        backendMessage.includes("User not found");
      if (isMissingUser) {
        setIsLoading(false);
        setUsersToFollowLoading(false);
        setTrendingLoading(false);
        navigate("/404", {
          replace: true,
          state: { missingUsername: username },
        });
        return;
      }
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_pk");
        localStorage.removeItem("user_username");
        navigate("/");
        return;
      }
      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
      setUsersToFollowLoading(false);
      setTrendingLoading(false);
    }
  }, [username, navigate, requireAuth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    user,
    setUser,
    followers,
    setFollowers,
    following,
    setFollowing,
    usersToFollow,
    setUsersToFollow,
    trending,
    setTrending,
    isFollowing,
    setIsFollowing,
    isLoading,
    usersToFollowLoading,
    trendingLoading,
    error,
    refreshProfile: fetchData,
    setError,
  };
};
