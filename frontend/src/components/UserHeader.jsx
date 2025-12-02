import { useState, useRef } from "react";
import { api } from "../api";
import { getCoverImageUrl, getProfilePictureUrl } from "../utils/imageUtils";
import { parseApiErrorMessage, validateImageFile } from "../utils/validation";
import FieldError from "./FieldError";

const UserHeader = ({ user, setUser, isEditing, editedUser, handleChange, handleEdit, handleSaveEdit, isCurrentUser, onFollowToggle, isFollowing, onDeleteProfile, formErrors = {}, setIsEditing }) => {
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
    if (file) {
      const errorText = validateImageFile(file);
      if (errorText) {
        setUploadError(errorText);
        return;
      }
      setUploadError("");
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const errorText = validateImageFile(file);
      if (errorText) {
        setCoverUploadError(errorText);
        return;
      }
      setCoverUploadError("");
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const handleUploadProfilePicture = async () => {
    setIsUploadingProfile(true);
    try {
      const file = fileInputRef.current.files[0];
      if (!file) return;
      const imageError = validateImageFile(file);
      if (imageError) {
        setUploadError(imageError);
        return;
      }
      const formData = new FormData();
      formData.append("profile_picture", file);
      const token = localStorage.getItem("token");
      const response = await api.post(`/users/${user.user_pk}/profile-picture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setUser((prevUser) => ({
        ...prevUser,
        user_profile_picture: response.data.user_profile_picture,
      }));
      setProfilePicture(null);
      setUploadError("");
    } catch (error) {
      setUploadError(parseApiErrorMessage(error, "Failed to upload profile picture. Please try again."));
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleUploadCoverPicture = async () => {
    setIsUploadingCover(true);
    try {
      const file = coverInputRef.current.files[0];
      if (!file) return;
      const imageError = validateImageFile(file);
      if (imageError) {
        setCoverUploadError(imageError);
        return;
      }
      const formData = new FormData();
      formData.append("cover_picture", file);
      const token = localStorage.getItem("token");
      const response = await api.post(`/users/${user.user_pk}/cover-picture`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setUser?.((prevUser) => ({
        ...prevUser,
        user_cover_picture: response.data.user_cover_picture,
      }));
      setCoverImage(null);
      setCoverUploadError("");
    } catch (error) {
      setCoverUploadError(parseApiErrorMessage(error, "Failed to upload cover picture. Please try again."));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const closeActionsMenu = () => setIsActionsMenuOpen(false);

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="user-header-wrapper">
      <div className="user-cover">
        <div
          className="cover-image"
          style={{
            backgroundImage: coverUrl ? `url(${coverUrl})` : "none",
          }}
        />
        {isCurrentUser && (
          <div className="cover-controls">
            <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" style={{ display: "none" }} />
            <div className="cover-buttons">
              <button type="button" className="cover-btn" onClick={() => coverInputRef.current?.click()}>
                <i className="fa-solid fa-image"></i>
                <span>Change cover</span>
              </button>
              {coverImage && (
                <button type="button" className="cover-btn save" onClick={handleUploadCoverPicture} disabled={isUploadingCover}>
                  {isUploadingCover ? "Saving cover..." : "Save cover"}
                </button>
              )}
            </div>
            <span className="upload-error">{coverUploadError || ""}</span>
          </div>
        )}
      </div>
      <div className="user-header">
        <div className="profile-picture-container">
          <img src={profilePicture || getProfilePictureUrl(user.user_profile_picture)} alt="Profile" className="user-avatar" />
          {isCurrentUser && <input type="file" ref={fileInputRef} onChange={handleProfilePictureChange} accept="image/*" style={{ display: "none" }} />}
          {profilePicture && (
            <div className="profile-picture-preview">
              <button type="button" className="save-profile-btn" onClick={handleUploadProfilePicture} disabled={isUploadingProfile}>
                {isUploadingProfile ? "Saving..." : "Save Image"}
              </button>
            </div>
          )}
          <span className="upload-error">{uploadError || ""}</span>
        </div>
        <div className="user-info">
          {isEditing ? (
            <>
              <input type="text" name="user_full_name" value={editedUser.user_full_name || ""} onChange={handleChange} className="form-control" placeholder="Full Name" />
              <FieldError error={formErrors.user_full_name} className="field-error" />
              <input type="text" name="user_username" value={editedUser.user_username || ""} onChange={handleChange} className="form-control" placeholder="Username" />
              <FieldError error={formErrors.user_username} className="field-error" />
              <input type="email" name="user_email" value={editedUser.user_email || ""} className="form-control disabled-input" disabled />
              <FieldError error={formErrors.user_email} className="field-error" />
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
                <div>
                  <h2 className="user-name">{user.user_full_name}</h2>
                  <div className="user-handle-email">
                    <span className="user-handle">@{user.user_username}</span>
                    <span className="divider">·</span>
                    <span className="user-email">{user.user_email}</span>
                  </div>
                </div>
                <div className="user-actions inline-actions">
                  {!isCurrentUser && (
                    <button className={`follow-btn ${isFollowing ? "unfollow" : ""}`} onClick={onFollowToggle}>
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  )}
                </div>
                {isCurrentUser && (
                  <div className="user-actions-menu">
                    <button type="button" className="action-menu-btn" aria-label="Open profile actions" aria-expanded={isActionsMenuOpen} onClick={() => setIsActionsMenuOpen((prev) => !prev)}>
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    {isActionsMenuOpen && (
                      <div className="action-menu-dropdown">
                        <button
                          type="button"
                          onClick={() => {
                            closeActionsMenu();
                            handleEdit();
                          }}
                        >
                          Edit profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            closeActionsMenu();
                            fileInputRef.current.click();
                          }}
                        >
                          Upload profile picture
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            closeActionsMenu();
                            onDeleteProfile();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
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
