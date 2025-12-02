import { useState, useEffect } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import "../css/WhoToFollow.css";
import { getProfilePictureUrl } from "../utils/imageUtils";
import ImagePlaceholder from "./ImagePlaceholder";
import { buildProfilePath } from "../utils/urlHelpers";

const WhoToFollow = ({ users: initialUsers, onFollowChange }) => {
  const [visibleUsers, setVisibleUsers] = useState(3);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      const currentUserPk = localStorage.getItem("user_pk");
      setUsers(
        initialUsers
          .filter((user) => user.user_pk !== currentUserPk)
          .map((user) => ({
            ...user,
            is_following: user.is_following ?? false,
          }))
      );
    }
  }, [initialUsers]);

  const loadMoreUsers = () => {
    setVisibleUsers((prev) => prev + 3);
  };

  const handleFollow = async (userPk, index) => {
    const token = localStorage.getItem("token");
    const currentUserPk = localStorage.getItem("user_pk");
    if (userPk === currentUserPk) {
      console.warn("Cannot follow yourself!");
      return;
    }
    const isFollowing = users[index].is_following;
    const targetUser = users[index];
    try {
      const updatedUsers = [...users];
      updatedUsers[index].is_following = !isFollowing;
      setUsers(updatedUsers);
      if (isFollowing) {
        await api.delete(`/follows/${userPk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post("/follows", { followed_user_fk: userPk }, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (typeof onFollowChange === "function") {
        onFollowChange(!isFollowing, targetUser);
      }
    } catch (error) {
      console.error("Error handling follow:", error.response?.data || error.message);
      const updatedUsers = [...users];
      updatedUsers[index].is_following = isFollowing;
      setUsers(updatedUsers);
    }
  };

  return (
    <div className="who-to-follow">
      <h2>Who to follow</h2>
      {users.length > 0 ? (
        <div className="follow-suggestion">
          {users.slice(0, visibleUsers).map((user, index) => {
            return (
              <div key={user.user_pk} className="follow-suggestion-item">
                <Link to={buildProfilePath(user)} className="follow-suggestion-link">
                  <ImagePlaceholder src={getProfilePictureUrl(user.user_profile_picture)} alt={user.user_full_name} className="follow-suggestion-avatar" placeholderSrc={getProfilePictureUrl(null)} />

                  <div className="follow-suggestion-details">
                    <div className="follow-suggestion-name">{user.user_full_name}</div>
                    <div className="follow-suggestion-handle">@{user.user_username}</div>
                  </div>
                </Link>
                <button className={`follow-btn ${user.is_following ? "unfollow" : ""}`} onClick={() => handleFollow(user.user_pk, index)}>
                  <i className={user.is_following ? "fa-solid fa-user-check" : "fa-solid fa-user-plus"}></i>
                </button>
              </div>
            );
          })}
          {visibleUsers < users.length && (
            <button className="show-more-btn" onClick={loadMoreUsers}>
              Show more
            </button>
          )}
        </div>
      ) : (
        <p>No more users to follow.</p>
      )}
    </div>
  );
};

export default WhoToFollow;
