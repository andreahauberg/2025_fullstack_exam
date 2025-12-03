import { getProfilePictureUrl } from "../utils/imageUtils";

const ProfileTag = ({ userPk, userUsername, userFullName, userProfilePicture }) => {
  const profilePictureUrl = getProfilePictureUrl(userProfilePicture);

  return (
    <div
      id="profile_tag"
      className="profile-tag"
      onClick={() =>
        (window.location.href = `/profile/${userUsername || userPk}`)
      }>
      <img
        src={profilePictureUrl}
        alt="Profile"
        className="profile-tag-avatar"
      />
      <div className="profile-tag-info">
        <div className="profile-tag-name">{userFullName}</div>
        <div className="profile-tag-handle">@{userUsername}</div>
      </div>
    </div>
  );
};

export default ProfileTag;


