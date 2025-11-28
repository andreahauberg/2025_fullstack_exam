import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { getProfilePictureUrl } from "../utils/imageUtils";

const PostHeader = ({ user, created_at }) => {
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

  const currentUserPk = localStorage.getItem("user_pk");
  const isCurrentUser = user?.user_pk === currentUserPk;

  return (
    <div className="post__header">
      <Link
        to={
          isCurrentUser ? `/profile/${user.user_pk}` : `/user/${user.user_pk}`
        }
        className="post__user-link">
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
            {created_at && formatTime(created_at)}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostHeader;
