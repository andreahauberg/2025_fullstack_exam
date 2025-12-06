import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export const useFollowActions = ({
  user,
  setUser,
  followers,
  setFollowers,
  following,
  setFollowing,
  isFollowing,
  setIsFollowing,
  setError,
}) => {
  const navigate = useNavigate();

  const handleFollowToggle = useCallback(async () => {
    const currentUserPk = localStorage.getItem("user_pk");
    const currentUsername = localStorage.getItem("user_username");
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      if (wasFollowing) {
        await api.delete(`/follows/${user?.user_pk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowers((prev) =>
          (prev || []).filter(
            (f) => String(f.user_pk) !== String(currentUserPk)
          )
        );
        setUser((prev) => ({
          ...prev,
          followers_count: Math.max(0, Number(prev?.followers_count || 0) - 1),
        }));
      } else {
        await api.post(
          "/follows",
          { followed_user_fk: user?.user_pk },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowers((prev) => [
          ...(prev || []),
          {
            user_pk: currentUserPk,
            user_username: currentUsername,
            user_full_name: currentUsername,
          },
        ]);
        setUser((prev) => ({
          ...prev,
          followers_count: Number(prev?.followers_count || 0) + 1,
        }));
      }
    } catch (err) {
      setIsFollowing(wasFollowing);
      console.error(
        "Error updating follow status:",
        err.response?.data || err.message
      );
      setError?.("Failed to update follow status.");
    }
  }, [
    isFollowing,
    navigate,
    setError,
    setFollowers,
    setIsFollowing,
    user,
    setUser,
  ]);

  const handleSidebarFollowChange = useCallback(
    (isNowFollowing, targetUser) => {
      if (!targetUser?.user_pk) return;

      const currentUserPk = localStorage.getItem("user_pk");

      setFollowing((prev) => {
        if (isNowFollowing) {
          const exists = prev.some(
            (u) => String(u.user_pk) === String(targetUser.user_pk)
          );
          if (exists) return prev;
          return [
            ...(prev || []),
            {
              user_pk: targetUser.user_pk,
              user_username: targetUser.user_username,
              user_full_name: targetUser.user_full_name,
            },
          ];
        }
        return (
          prev?.filter(
            (u) => String(u.user_pk) !== String(targetUser.user_pk)
          ) || []
        );
      });

      if (String(currentUserPk) === String(user?.user_pk)) {
        setUser((prev) => ({
          ...prev,
          following_count: isNowFollowing
            ? Number(prev?.following_count || 0) + 1
            : Math.max(0, Number(prev?.following_count || 0) - 1),
        }));
      } else {
        setUser((prev) => ({
          ...prev,
          followers_count: isNowFollowing
            ? Number(prev?.followers_count || 0) + 1
            : Math.max(0, Number(prev?.followers_count || 0) - 1),
        }));
      }
    },
    [setFollowing, setUser, user]
  );

  return { handleFollowToggle, handleSidebarFollowChange };
};
