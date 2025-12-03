import { api } from "../api";

const getApiOrigin = () => {
  const baseFromApi = api?.defaults?.baseURL;
  const envBase =
    process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_BASE;
  const fallbackBase = "https://two025-fullstack-exam-zzdo.onrender.com";
  const candidate = baseFromApi || envBase || fallbackBase;

  try {
    return new URL(candidate).origin;
  } catch (e) {
    return "https://two025-fullstack-exam-zzdo.onrender.com";
  }
};

const STORAGE_BASE = `${getApiOrigin()}/storage`;
const FRONTEND_ORIGIN =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.REACT_FRONTEND_APP_URL;

export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) {
    return `${FRONTEND_ORIGIN}/avatar.jpg`;
  }

  if (profilePicture.startsWith("http")) {
    return profilePicture;
  }

  const cleaned = profilePicture.replace(/^\/?storage\//, "");
  return `${STORAGE_BASE}/${cleaned}`;
};

export const getPostImageUrl = (postImage) => {
  if (!postImage) {
    return null;
  }

  if (postImage.startsWith("http")) {
    return postImage;
  }

  const cleaned = postImage.replace(/^\/?storage\//, "");
  return `${STORAGE_BASE}/${cleaned}`;
};

export const getCoverImageUrl = (coverImage) => {
  if (!coverImage) {
    return null;
  }

  if (coverImage.startsWith("http")) {
    return coverImage;
  }

  const cleaned = coverImage.replace(/^\/?storage\//, "");
  return `${STORAGE_BASE}/${cleaned}`;
};
