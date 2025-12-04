import { useState } from "react";
import { api } from "../api";
import Dialog from "./Dialog";
import {
  extractFieldErrors,
  parseApiErrorMessage,
  validateFields,
} from "../utils/validation";
import FieldError from "./FieldError";

const LoginDialog = ({ isOpen, onClose, onSuccess, onOpenSignup }) => {
  const [formData, setFormData] = useState({
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

    const clientErrors = validateFields(formData, ["user_email", "user_password"]);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/login", formData);
      setErrors({});
      localStorage.setItem("token", response.data.token); 
      localStorage.setItem("user_pk", response.data.user.user_pk);
      localStorage.setItem("user_username", response.data.user.user_username);
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
          user_email: fallback,
          user_password: fallback,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Log in" logo={true}>
      <form className="x-dialog__form" onSubmit={handleSubmit} noValidate>
        <input
          name="user_email"
          type="email"
          placeholder="Email"
          value={formData.user_email}
          onChange={handleChange}
          disabled={isLoading}
          autoFocus
          className={errors.user_email ? "form-control input-error" : "form-control"}
        />
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
        <FieldError error={errors.user_password} />

        <button type="submit" className="x-dialog__btn" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="x-dialog__alt">
        Don't have an account?{" "}
        <button
          href="#"
          onClick={() => {
            onClose();
            onOpenSignup(); 
          }}>
          Sign up
        </button>
      </p>
    </Dialog>
  );
};

export default LoginDialog;
