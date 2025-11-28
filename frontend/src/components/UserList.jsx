import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getProfilePictureUrl } from "../utils/imageUtils";

const UserList = ({ title, users, emptyMessage, maxVisible = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentUserPk = localStorage.getItem("user_pk");

  // Vis kun de første `maxVisible` brugere, hvis listen ikke er udvidet
  const visibleUsers = isExpanded ? users : users.slice(0, maxVisible);

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
          {visibleUsers.map((user) => {
            const isCurrentUser = currentUserPk === user.user_pk;
            return (
              <li key={user.user_pk} className="user-list-item">
                <Link
                  to={
                    isCurrentUser
                      ? `/profile/${user.user_pk}`
                      : `/user/${user.user_pk}`
                  }
                  className="user-list-link">
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
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty-message">{emptyMessage}</p>
      )}
    </div>
  );
};

export default UserList;
