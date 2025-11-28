export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) {
    return "http://localhost:3000/avatar.jpg";
  }

  if (profilePicture.startsWith("http")) {
    return profilePicture;
  }

  return `http://localhost/storage/${profilePicture}`;
};

export const getPostImageUrl = (postImage) => {
  if (!postImage) {
    return null;
  }

  if (postImage.startsWith("http")) {
    return postImage;
  }

  return `http://localhost/storage/${postImage}`;
};
