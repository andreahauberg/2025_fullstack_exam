import React, { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import {
  extractFieldErrors,
  parseApiErrorMessage,
  validateFields,
} from "../utils/validation";
import FieldError from "./FieldError";

function Login() {
  const [formData, setFormData] = useState({
    user_email: "",
    user_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validateFields(formData, [
      "user_email",
      "user_password",
    ]);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 1: Hent CSRF-cookie (nødvendigt for Sanctum SPA)
      await api.get("/sanctum/csrf-cookie");

      // 2: Login → dette sætter session-cookie i browseren
      const response = await api.post("/login", formData);

      if (response.data.success) {
        const user = response.data.user;

        localStorage.setItem("user_pk", user.user_pk);
        localStorage.setItem("user_username", user.user_username);

        setErrors({});
        navigate("/home");
      } else {
        setErrors({
          user_email: response.data.message || "Login failed.",
          user_password: response.data.message || "Login failed.",
        });
      }
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        const fallback = parseApiErrorMessage(
          error,
          "Invalid credentials or network error."
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
    <div className="login-container">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            disabled={isLoading}
            className={
              errors.user_email
                ? "form-control input-error"
                : "form-control"
            }
          />
          <FieldError error={errors.user_email} />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="user_password"
            value={formData.user_password}
            onChange={handleChange}
            disabled={isLoading}
            className={
              errors.user_password
                ? "form-control input-error"
                : "form-control"
            }
          />
          <FieldError error={errors.user_password} />
        </div>

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}

export default Login;