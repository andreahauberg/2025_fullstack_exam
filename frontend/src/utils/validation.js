const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._]+$/;

const normalizeText = (value) => (typeof value === "string" ? value.trim() : "");

export const getErrorText = (error) =>
  Array.isArray(error) ? error[0] : error || "";

export const parseApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.message === "string" && error.message.trim())
    return error.message;
  return fallback;
};

export const extractFieldErrors = (error) =>
  error?.response?.data?.errors || {};

export const validateSignup = (data) => {
  const errors = {};

  const fullName = normalizeText(data.user_full_name);
  const username = normalizeText(data.user_username);
  const email = normalizeText(data.user_email);
  const password = data.user_password || "";

  if (!fullName) errors.user_full_name = "Full name is required.";
  else if (fullName.length > 20)
    errors.user_full_name = "Full name cannot exceed 20 characters.";

  if (!username) {
    errors.user_username = "Username is required.";
  } else {
    if (username.length < 3)
      errors.user_username = "Username must be at least 3 characters.";
    if (username.length > 20)
      errors.user_username = "Username cannot exceed 20 characters.";
    if (!usernameRegex.test(username))
      errors.user_username =
        "Username can only contain letters, numbers, underscores, and dots.";
  }

  if (!email) {
    errors.user_email = "Email is required.";
  } else if (!emailRegex.test(email)) {
    errors.user_email = "Please enter a valid email.";
  } else if (email.length > 100) {
    errors.user_email = "Email cannot exceed 100 characters.";
  }

  if (!password) {
    errors.user_password = "Password is required.";
  } else if (password.length < 8) {
    errors.user_password = "Password must be at least 8 characters.";
  } else if (password.length > 255) {
    errors.user_password = "Password is too long.";
  }

  return errors;
};

export const validateLogin = (data) => {
  const errors = {};

  const email = normalizeText(data.user_email);
  const password = data.user_password || "";

  if (!email) {
    errors.user_email = "Email is required.";
  } else if (!emailRegex.test(email)) {
    errors.user_email = "Please enter a valid email.";
  }

  if (!password) {
    errors.user_password = "Password is required.";
  } else if (password.length < 8) {
    errors.user_password = "Password must be at least 8 characters.";
  } else if (password.length > 255) {
    errors.user_password = "Password is too long.";
  }

  return errors;
};

export const validateComment = (comment) => {
  const trimmed = normalizeText(comment);
  if (!trimmed) return "Comment cannot be empty.";
  if (trimmed.length > 280) return "Comment cannot exceed 280 characters.";
  return "";
};

export const validateImageFile = (
  file,
  { allowedTypes = ["image/jpeg", "image/png", "image/gif"], maxMB = 2 } = {}
) => {
  if (!file) return "";
  if (!allowedTypes.includes(file.type))
    return "Only JPG, PNG, or GIF images are allowed.";

  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > maxMB) return `Image must be smaller than ${maxMB}MB.`;

  return "";
};

export const validatePost = (content, imageFile) => {
  const errors = {};
  const trimmedContent = normalizeText(content);

  if (!trimmedContent) errors.post_content = "Post content is required.";
  else if (trimmedContent.length > 280)
    errors.post_content = "Post cannot exceed 280 characters.";

  const imageError = validateImageFile(imageFile);
  if (imageError) errors.post_image = imageError;

  return errors;
};

export const validateProfileUpdate = (data) => {
  const errors = {};
  const fullName = normalizeText(data.user_full_name);
  const username = normalizeText(data.user_username);
  const email = normalizeText(data.user_email);

  if (!fullName) {
    errors.user_full_name = "Full name is required.";
  } else if (fullName.length > 20) {
    errors.user_full_name = "Full name cannot exceed 20 characters.";
  }

  if (!username) {
    errors.user_username = "Username is required.";
  } else {
    if (username.length < 3)
      errors.user_username = "Username must be at least 3 characters.";
    if (username.length > 20)
      errors.user_username = "Username cannot exceed 20 characters.";
    if (!usernameRegex.test(username))
      errors.user_username =
        "Username can only contain letters, numbers, underscores, and dots.";
  }

  if (!email) {
    errors.user_email = "Email is required.";
  } else if (!emailRegex.test(email)) {
    errors.user_email = "Please enter a valid email.";
  } else if (email.length > 100) {
    errors.user_email = "Email cannot exceed 100 characters.";
  }

  return errors;
};
