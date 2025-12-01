import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { getProfilePictureUrl } from "../utils/imageUtils";
import { buildProfilePath } from "../utils/urlHelpers";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const PostHeader = ({ user, created_at, edited }) => {
  const formatTime = (date) => {
    const now = moment();
    const postDate = moment(date);
    const diffInMinutes = now.diff(postDate, "minutes");
    const diffInHours = now.diff(postDate, "hours");
    const diffInDays = now.diff(postDate, "days");
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return postDate.format("D MMM");
    }
  };

  const { user: authUser } = useAuth();
  const profileHref = buildProfilePath(user, authUser?.user_pk, authUser?.user_username);
  const userPk = user?.user_pk;
  const currentUserPk = authUser?.user_pk;
  const isCurrentUser =
    userPk && currentUserPk && String(userPk) === String(currentUserPk);
  const [isFollowing, setIsFollowing] = useState(!!user?.is_following);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(!!user?.is_following);
  }, [user]);

  const handleFollow = async () => {
    if (!userPk || isCurrentUser || isFollowLoading) return;
    const prev = isFollowing;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        setIsFollowing(false);
        await api.delete(`/follows/${userPk}`);
      } else {
        setIsFollowing(true);
        await api.post("/follows", { followed_user_fk: userPk });
      }
    } catch (err) {
      setIsFollowing(prev);
      console.error("Follow toggle failed:", err.response?.data || err.message);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="post__header">
      <Link to={profileHref} className="post__user-link">
        <img
          src={getProfilePictureUrl(user?.user_profile_picture)}
          alt="Profile"
          className="post__avatar"
        />

        <div>
          <div className="post__user-name">
            {user?.user_full_name || "Unknown User"}
          </div>
          <div className="post__user-handle">
            @{user?.user_username || "unknown"} ·{" "}
            {created_at && formatTime(created_at)} {edited ? "· Edited" : ""}
          </div>
        </div>
      </Link>
      {!isCurrentUser && userPk && (
        <button
          className={`follow-chip ${isFollowing ? "following" : "follow"}`}
          onClick={handleFollow}
          disabled={isFollowLoading}>
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
};

export default PostHeader;
