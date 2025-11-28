import { useState, useRef } from "react";
import { api } from "../api";
import { getProfilePictureUrl } from "../utils/imageUtils";

const UserHeader = ({
  user,
  setUser,
  isEditing,
  editedUser,
  handleChange,
  handleEdit,
  handleSaveEdit,
  isCurrentUser,
  onFollowToggle,
  isFollowing,
  onDeleteProfile,
}) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleUploadProfilePicture = async () => {
    try {
      const file = fileInputRef.current.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("profile_picture", file);

      const token = localStorage.getItem("token");
      const response = await api.post(
        `/users/${user.user_pk}/profile-picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((prevUser) => ({
        ...prevUser,
        user_profile_picture: response.data.user_profile_picture,
      }));
      setProfilePicture(null);
    } catch (error) {
      console.error(
        "Error uploading profile picture:",
        error.response?.data || error.message
      );
      alert("Failed to upload profile picture. Please try again.");
    }
  };

  return (
    <div className="user-header">
      <div className="profile-picture-container">
        <img
          src={profilePicture || getProfilePictureUrl(user.user_profile_picture)}
          alt="Profile"
          className="user-avatar"
        />
        {isCurrentUser && (
          <div className="profile-picture-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/*"
              style={{ display: "none" }}
            />
            <button
              className="upload-picture-btn"
              onClick={() => fileInputRef.current.click()}
            >
              Change Picture
            </button>
            {profilePicture && (
              <button
                className="save-picture-btn"
                onClick={handleUploadProfilePicture}
              >
                Save Picture
              </button>
            )}
          </div>
        )}
      </div>
      <div className="user-info">
        {isEditing ? (
          <>
            <input
              type="text"
              name="user_full_name"
              value={editedUser.user_full_name || ""}
              onChange={handleChange}
              className="user-input"
              placeholder="Full Name"
            />
            <input
              type="text"
              name="user_username"
              value={editedUser.user_username || ""}
              onChange={handleChange}
              className="user-input"
              placeholder="Username"
            />
            <input
              type="email"
              name="user_email"
              value={editedUser.user_email || ""}
              className="user-input disabled-input"
              disabled
            />
            <div className="user-actions">
              <button className="save-btn" onClick={handleSaveEdit}>
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{user.user_full_name}</h2>
            <p className="user-handle">@{user.user_username}</p>
            <p className="user-email">{user.user_email}</p>
            <div className="user-actions">
              {isCurrentUser ? (
                <>
                  <button className="edit-btn" onClick={handleEdit}>
                    Edit Profile
                  </button>
                  <button className="delete-btn" onClick={onDeleteProfile}>
                    Delete Profile
                  </button>
                </>
              ) : (
                <button
                  className={`follow-btn ${isFollowing ? "unfollow" : ""}`}
                  onClick={onFollowToggle}>
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserHeader;
