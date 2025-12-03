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

    try {
      if (requireAuth) {
        const authCheck = await api.get("/user");
        if (!authCheck.data) {
          navigate("/");
          return;
        }
      }

      const [userResp, trendingResp, suggestionsResp] = await Promise.all([
        api.get(`/users/${username}`),
        api.get("/trending"),
        api.get("/users-to-follow"),
      ]);

      if (!userResp.data?.user) {
        navigate("/404", { replace: true, state: { missingUsername: username } });
        return;
      }

      const authUserPk = localStorage.getItem("user_pk");

      setUser(userResp.data.user);
      setFollowers(userResp.data.followers || []);
      setFollowing(userResp.data.following || []);
      setTrending(trendingResp.data || []);
      setUsersToFollow(suggestionsResp.data || []);
      setIsFollowing(
        userResp.data.followers?.some(
          (f) => String(f.user_pk) === String(authUserPk)
        ) || false
      );

    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/");
        return;
      }

      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
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
    trending,
    isFollowing,
    setIsFollowing,
    isLoading,
    error,
    refreshProfile: fetchData,
    setError,
  };
};