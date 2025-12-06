import { getProfilePictureUrl } from "../utils/imageUtils";
import { useNavigate } from "react-router-dom";
import ImagePlaceholder from "./ImagePlaceholder"

const ProfileTag = ({
  userPk,
  userUsername,
  userFullName,
  userProfilePicture,
}) => {
  const navigate = useNavigate();
  const profilePictureUrl = getProfilePictureUrl(userProfilePicture);

  const goToProfile = () => {
    navigate(`/profile/${userUsername || userPk}`);
  };

  return (
    <div id="profile_tag" className="profile-tag" onClick={goToProfile}>
      <ImagePlaceholder
        src={profilePictureUrl}
        alt="Profile"
        className="profile-tag-avatar"
        placeholderSrc={getProfilePictureUrl(null)}
      />
      <div className="profile-tag-info">
        <div className="profile-tag-name">{userFullName}</div>
        <div className="profile-tag-handle">@{userUsername}</div>
      </div>
    </div>
  );
};

export default ProfileTag;
