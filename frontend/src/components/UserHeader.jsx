import { useState, useRef } from "react";
import { api } from "../api";
import { getCoverImageUrl, getProfilePictureUrl } from "../utils/imageUtils";
import ImagePlaceholder from "./ImagePlaceholder";
import { parseApiErrorMessage, validateImageFile } from "../utils/validation";
import FieldError from "./FieldError";

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
  formErrors = {},
  handleCancelEdit,
}) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverUploadError, setCoverUploadError] = useState("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const coverUrl = coverImage || getCoverImageUrl(user.user_cover_picture);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError("");
    setProfilePicture(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setCoverUploadError(error);
      return;
    }

    setCoverUploadError("");
    setCoverImage(URL.createObjectURL(file));
  };

  const handleUploadProfilePicture = async () => {
    setIsUploadingProfile(true);
    try {
      const file = fileInputRef.current.files[0];
      if (!file) return;

      const error = validateImageFile(file);
      if (error) {
        setUploadError(error);
        return;
      }

      const formData = new FormData();
      formData.append("profile_picture", file);

      const response = await api.post(
        `/users/${user.user_pk}/profile-picture`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUser((prev) => ({
        ...prev,
        user_profile_picture: response.data.user_profile_picture,
      }));

      setProfilePicture(null);
    } catch (err) {
      setUploadError(
        parseApiErrorMessage(err, "Failed to upload profile picture.")
      );
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleUploadCoverPicture = async () => {
    setIsUploadingCover(true);
    try {
      const file = coverInputRef.current.files[0];
      if (!file) return;

      const error = validateImageFile(file);
      if (error) {
        setCoverUploadError(error);
        return;
      }

      const formData = new FormData();
      formData.append("cover_picture", file);

      const response = await api.post(
        `/users/${user.user_pk}/cover-picture`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUser((prev) => ({
        ...prev,
        user_cover_picture: response.data.user_cover_picture,
      }));

      setCoverImage(null);
    } catch (err) {
      setCoverUploadError(
        parseApiErrorMessage(err, "Failed to upload cover image.")
      );
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <div className="user-header-wrapper">
      <div className="user-cover">
        <div
          className="cover-image"
          style={{ backgroundImage: coverUrl ? `url(${coverUrl})` : "none" }}
        />

        {isCurrentUser && (
          <div className="cover-controls">
            <input
              type="file"
              ref={coverInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCoverChange}
            />

            <div className="cover-buttons">
              <button
                className="cover-btn"
                onClick={() => coverInputRef.current?.click()}
              >
                <i className="fa-solid fa-image"></i>
                <span>Change cover</span>
              </button>

              {coverImage && (
                <button
                  className="cover-btn save"
                  disabled={isUploadingCover}
                  onClick={handleUploadCoverPicture}
                >
                  {isUploadingCover ? "Saving cover…" : "Save cover"}
                </button>
              )}
            </div>

            <span className="upload-error">{coverUploadError}</span>
          </div>
        )}
      </div>

      <div className="user-header">
        <div className="profile-picture-container">
          <ImagePlaceholder
            src={profilePicture || getProfilePictureUrl(user.user_profile_picture)}
            alt="Profile"
            className="user-avatar"
            placeholderSrc={getProfilePictureUrl(null)}
          />

          {isCurrentUser && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
              />

              {profilePicture && (
                <div className="profile-picture-preview">
                  <button
                    className="save-profile-btn"
                    disabled={isUploadingProfile}
                    onClick={handleUploadProfilePicture}
                  >
                    {isUploadingProfile ? "Saving…" : "Save Image"}
                  </button>
                </div>
              )}
            </>
          )}

          <span className="upload-error">{uploadError}</span>
        </div>

        <div className="user-info">
          {isEditing ? (
            <>
              <input
                type="text"
                name="user_full_name"
                value={editedUser.user_full_name || ""}
                onChange={handleChange}
                className="form-control"
                placeholder="Full Name"
              />
              <FieldError error={formErrors.user_full_name} />

              <input
                type="text"
                name="user_username"
                value={editedUser.user_username || ""}
                onChange={handleChange}
                className="form-control"
                placeholder="Username"
              />
              <FieldError error={formErrors.user_username} />

              <input
                type="email"
                name="user_email"
                value={editedUser.user_email || ""}
                disabled
                className="form-control disabled-input"
              />
              <FieldError error={formErrors.user_email} />

              <div className="user-actions">
                <button className="save-btn" onClick={handleSaveEdit}>
                  Save
                </button>
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="user-info-header">
                <h2 className="user-name">{user.user_full_name}</h2>

                <div className="user-handle-email">
                  <span className="user-handle">@{user.user_username}</span>
                  <span className="divider">·</span>
                  <span className="user-email">{user.user_email}</span>
                </div>

                {isCurrentUser ? (
                  <div className="user-actions-menu">
                    <button
                      className="action-menu-btn"
                      onClick={() => setIsActionsMenuOpen((v) => !v)}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    {isActionsMenuOpen && (
                      <div className="action-menu-dropdown">
                        <button onClick={handleEdit}>Edit profile</button>
                        <button onClick={() => fileInputRef.current?.click()}>
                          Upload profile picture
                        </button>
                        <button className="danger" onClick={onDeleteProfile}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    className={`follow-btn ${isFollowing ? "unfollow" : ""}`}
                    onClick={onFollowToggle}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHeader;