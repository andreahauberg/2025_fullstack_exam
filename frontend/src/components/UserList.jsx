import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getProfilePictureUrl } from "../utils/imageUtils";
import { buildProfilePath } from "../utils/urlHelpers";
import { api } from "../api";

const UserList = ({
  title,
  users: initialUsers,
  emptyMessage,
  maxVisible = 3,
  onFollowChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [users, setUsers] = useState([]);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const currentUserPk = localStorage.getItem("user_pk");

  useEffect(() => {
    if (initialUsers) {
      setUsers(
        initialUsers.map((user) => ({
          ...user,
          is_following: user.is_following ?? false,
        }))
      );
    }
  }, [initialUsers]);

  const visibleUsers = isExpanded ? users : users.slice(0, maxVisible);

  const handleFollow = async (userPk, index) => {
    if (!userPk || isFollowLoading) return;
    const isFollowing = users[index].is_following;
    const updatedUsers = [...users];
    updatedUsers[index].is_following = !isFollowing;
    setUsers(updatedUsers);
    setIsFollowLoading(true);

    if (typeof onFollowChange === "function") {
      onFollowChange(!isFollowing, {
        ...users[index],
        is_following: !isFollowing,
      });
    }

    try {
      const token = localStorage.getItem("token");
      if (isFollowing) {
        await api.delete(`/follows/${userPk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          "/follows",
          { followed_user_fk: userPk },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error(
        "Follow toggle failed:",
        error.response?.data || error.message
      );
      const updatedUsers = [...users];
      updatedUsers[index].is_following = isFollowing;
      setUsers(updatedUsers);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="user-list">
      <div
        className="user-list-header"
        onClick={() => setIsExpanded(!isExpanded)}>
        <h3>{title}</h3>
        {users.length > maxVisible && (
          <button className="user-list-toggle">
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>
      {users.length > 0 ? (
        <ul className={`user-list-items ${isExpanded ? "expanded" : ""}`}>
          {visibleUsers.map((user, index) => (
            <li key={user.user_pk} className="user-list-item">
              <Link to={buildProfilePath(user)} className="user-list-link">
                <img
                  src={getProfilePictureUrl(user.user_profile_picture)}
                  alt={user.user_full_name}
                  className="user-list-avatar"
                />
                <div className="user-list-info">
                  <p className="user-list-name">{user.user_full_name}</p>
                  <p className="user-list-handle">@{user.user_username}</p>
                </div>
              </Link>
              {user.user_pk !== currentUserPk && (
                <button
                  className={`follow-btn ${
                    user.is_following ? "unfollow" : ""
                  }`}
                  onClick={() => handleFollow(user.user_pk, index)}
                  aria-label="Follow">
                  <i
                    className={
                      user.is_following
                        ? "fa-solid fa-user-check"
                        : "fa-solid fa-user-plus"
                    }
                    aria-label="Unfollow"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">{emptyMessage}</p>
      )}
    </div>
  );
};

export default UserList;
