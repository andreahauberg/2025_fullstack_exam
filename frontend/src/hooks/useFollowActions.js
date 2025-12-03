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
    const token = localStorage.getItem("token");

    if (!token || !currentUserPk) {
      navigate("/");
      return;
    }

    const wasFollowing = isFollowing;
    const nowFollowing = !wasFollowing;

    setIsFollowing(nowFollowing);

    setFollowers((prev = []) =>
      nowFollowing
        ? [
            ...prev,
            {
              user_pk: currentUserPk,
              user_username: currentUsername,
              user_full_name: currentUsername,
            },
          ]
        : prev.filter((f) => String(f.user_pk) !== String(currentUserPk))
    );

    try {
      if (nowFollowing) {
        await api.post(
          "/follows",
          { followed_user_fk: user?.user_pk },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await api.delete(`/follows/${user?.user_pk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Error updating follow status:", err.response?.data || err.message);
      setIsFollowing(wasFollowing);

      setFollowers((prev = []) =>
        wasFollowing
          ? [
              ...prev,
              {
                user_pk: currentUserPk,
                user_username: currentUsername,
                user_full_name: currentUsername,
              },
            ]
          : prev.filter((f) => String(f.user_pk) !== String(currentUserPk))
      );

      setError?.("Failed to update follow status.");
    }
  }, [
    isFollowing,
    navigate,
    setError,
    setFollowers,
    setIsFollowing,
    user?.user_pk,
  ]);

  const handleSidebarFollowChange = useCallback(
    (isNowFollowing, targetUser) => {
      if (!targetUser?.user_pk) return;

      setFollowing((prev = []) => {
        if (isNowFollowing) {
          const alreadyInList = prev.some(
            (u) => String(u.user_pk) === String(targetUser.user_pk)
          );
          if (alreadyInList) return prev;

          return [...prev, targetUser];
        }

        return prev.filter(
          (u) => String(u.user_pk) !== String(targetUser.user_pk)
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