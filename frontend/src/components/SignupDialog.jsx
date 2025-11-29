import { useState } from "react";
import { api } from "../api";
import Dialog from "./Dialog";
import {
  extractFieldErrors,
  parseApiErrorMessage,
  validateSignup,
} from "../utils/validation";
import FieldError from "./FieldError";

const SignupDialog = ({ isOpen, onClose, onSuccess, onOpenLogin }) => {
  const [formData, setFormData] = useState({
    user_full_name: "",
    user_username: "",
    user_email: "",
    user_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validateSignup(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/signup", formData);
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        localStorage.setItem("token", "cookie-auth");
      }
      if (response.data?.user?.user_pk) {
        localStorage.setItem("user_pk", response.data.user.user_pk);
      }
      if (response.data?.user?.user_username) {
        localStorage.setItem("user_username", response.data.user.user_username);
      }
      setErrors({});
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        const fallback = parseApiErrorMessage(
          error,
          "Network error. Please check your connection."
        );
        setErrors({
          user_full_name: fallback,
          user_username: fallback,
          user_email: fallback,
          user_password: fallback,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create your account"
      logo={true}>
      <form className="x-dialog__form" onSubmit={handleSubmit} noValidate>
        <input
          name="user_full_name"
          type="text"
          placeholder="Name"
          value={formData.user_full_name}
          onChange={handleChange}
          disabled={isLoading}
          autoFocus
          className={errors.user_full_name ? "form-control input-error" : "form-control"}
        />
        <span className="field-hint">Max 20 characters</span>
        <FieldError error={errors.user_full_name} />

        <input
          name="user_username"
          type="text"
          placeholder="Username"
          value={formData.user_username}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.user_username ? "form-control input-error" : "form-control"}
        />
        <span className="field-hint">3-20 chars · letters, numbers, underscores, dots</span>
        <FieldError error={errors.user_username} />

        <input
          name="user_email"
          type="email"
          placeholder="Email"
          value={formData.user_email}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.user_email ? "form-control input-error" : "form-control"}
        />
        <span className="field-hint">Valid email · Max 100 characters</span>
        <FieldError error={errors.user_email} />

        <input
          name="user_password"
          type="password"
          placeholder="Password"
          value={formData.user_password}
          onChange={handleChange}
          disabled={isLoading}
          className={errors.user_password ? "form-control input-error" : "form-control"}
        />
        <span className="field-hint">Min. 8 characters</span>
        <FieldError error={errors.user_password} />

        <button type="submit" className="x-dialog__btn" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>
      <p className="x-dialog__alt">
        Already have an account?{" "}
        <button
          className="x-dialog__login-btn"
          onClick={() => {
            onClose();
            onOpenLogin();
          }}>
          Log in
        </button>
      </p>
    </Dialog>
  );
};

export default SignupDialog;
