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
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");

    if (requireAuth && !token) {
      setIsLoading(false);
      navigate("/");
      return;
    }

    const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    try {
      const [userResp, trendingResp, suggestResp] = await Promise.all([
        api.get(`/users/${username}`, authHeaders),

        token
          ? api.get("/trending", authHeaders)
          : Promise.resolve({ data: [] }),

        token
          ? api.get("/users-to-follow", authHeaders)
          : Promise.resolve({ data: [] }),
      ]);

      const userData = userResp.data?.user;
      if (!userData) {
        navigate("/404", { replace: true, state: { missingUsername: username } });
        return;
      }

      setUser(userData);
      setFollowers(userResp.data.followers || []);
      setFollowing(userResp.data.following || []);
      setTrending(trendingResp.data || []);
      setUsersToFollow(suggestResp.data || []);

      const currentPk = localStorage.getItem("user_pk");
      setIsFollowing(
        !!currentPk &&
        (userResp.data.followers || []).some(
          (f) => String(f.user_pk) === String(currentPk)
        )
      );
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "";

      const userMissing =
        status === 404 ||
        msg.includes("User not found") ||
        msg.includes("No query results");

      if (userMissing) {
        navigate("/404", { replace: true, state: { missingUsername: username } });
        return;
      }

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_pk");
        localStorage.removeItem("user_username");
        navigate("/");
        return;
      }

      setError("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [username, requireAuth, navigate]);

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
    error,
    refreshProfile: fetchData,
    setError,
  };
};