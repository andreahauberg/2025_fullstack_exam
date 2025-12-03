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

    setFollowers((prev) =>
      wasFollowing
        ? (prev || []).filter((f) => String(f.user_pk) !== String(currentUserPk))
        : [
            ...(prev || []),
            {
              user_pk: currentUserPk,
              user_username: currentUsername,
              user_full_name: currentUsername,
            },
          ]
    );

    try {
      if (wasFollowing) {
        await api.delete(`/follows/${user?.user_pk}`);
      } else {
        await api.post("/follows", { followed_user_fk: user?.user_pk });
      }
    } catch (err) {
      setIsFollowing(wasFollowing);

      setFollowers((prev) =>
        wasFollowing
          ? [
              ...(prev || []),
              {
                user_pk: currentUserPk,
                user_username: currentUsername,
                user_full_name: currentUsername,
              },
            ]
          : (prev || []).filter((f) => String(f.user_pk) !== String(currentUserPk))
      );

      console.error("Error updating follow status:", err);
      setError?.("Failed to update follow status.");

      if (err?.response?.status === 401) {
        localStorage.removeItem("user_pk");
        localStorage.removeItem("user_username");
        navigate("/");
      }
    }
  }, [
    isFollowing,
    navigate,
    setError,
    setFollowers,
    setIsFollowing,
    user,
  ]);

  const handleSidebarFollowChange = useCallback(
    (isNowFollowing, targetUser) => {
      if (!targetUser?.user_pk) return;

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

      setUser((prev) => ({
        ...prev,
        following_count: isNowFollowing
          ? Number(prev?.following_count || 0) + 1
          : Math.max(0, Number(prev?.following_count || 0) - 1),
      }));
    },
    [setFollowing, setUser]
  );

  return { handleFollowToggle, handleSidebarFollowChange };
};