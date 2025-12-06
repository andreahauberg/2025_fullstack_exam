const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9._]+$/;

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() : "";
const normalizePassword = (value) => (typeof value === "string" ? value : "");
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const required = (message) => (value) => !value ? message : "";
const minLen =
  (min, message) =>
    (value = "") =>
      value.length < min ? message : "";
const maxLen =
  (max, message) =>
    (value = "") =>
      value.length > max ? message : "";
const pattern =
  (regex, message) =>
    (value = "") =>
      value && !regex.test(value) ? message : "";

const runRules = (value, rules = []) =>
  rules.map((rule) => rule(value)).find(Boolean) || "";

const fieldRules = {
  user_full_name: {
    normalize: normalizeText,
    rules: [
      required("Full name is required."),
      maxLen(20, "Full name cannot exceed 20 characters."),
    ],
  },
  user_username: {
    normalize: normalizeText,
    rules: [
      required("Username is required."),
      minLen(3, "Username must be at least 3 characters."),
      maxLen(20, "Username cannot exceed 20 characters."),
      pattern(
        usernameRegex,
        "Username can only contain letters, numbers, underscores, and dots."
      ),
    ],
  },
  user_email: {
    normalize: normalizeEmail,
    rules: [
      required("Email is required."),
      pattern(emailRegex, "Please enter a valid email."),
      maxLen(100, "Email cannot exceed 100 characters."),
    ],
  },
  user_password: {
    normalize: normalizePassword,
    rules: [
      required("Password is required."),
      minLen(8, "Password must be at least 8 characters."),
      maxLen(255, "Password is too long."),
    ],
  },
  post_content: {
    normalize: normalizeText,
    rules: [
      required("Post content is required."),
      maxLen(280, "Post cannot exceed 280 characters."),
    ],
  },
  comment_message: {
    normalize: normalizeText,
    rules: [
      required("Comment cannot be empty."),
      maxLen(280, "Comment cannot exceed 280 characters."),
    ],
  },
};

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

export const validateFields = (data, fields) => {
  const errors = {};
  fields.forEach((field) => {
    const config = fieldRules[field];
    if (!config) return;
    const value = config.normalize
      ? config.normalize(data[field])
      : data[field];
    const error = runRules(value, config.rules);
    if (error) errors[field] = error;
  });
  return errors;
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
