import React, { useState } from "react";
import { api } from "../api"; // Importer den centrale api-instans
import { useNavigate } from "react-router-dom";
import {
  extractFieldErrors,
  parseApiErrorMessage,
  validateSignup,
} from "../utils/validation";
import FieldError from "./FieldError";

function Signup() {
  const [formData, setFormData] = useState({
    user_full_name: "",
    user_username: "",
    user_email: "",
    user_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Tilføj loading-state
  const navigate = useNavigate();

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

    setIsLoading(true); // Aktiver loading
    try {
      await api.post("/signup", formData);
      setErrors({});
      setTimeout(() => {
        navigate("/login");
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
      setIsLoading(false); // Deaktiver loading
    }
  };

  return (
    <div className="signup-container">
      <h2>Create your account</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Full Name:</label>
          <span className="field-hint">Max 20 characters</span>
          <input
            type="text"
            name="user_full_name"
            value={formData.user_full_name}
            onChange={handleChange}
            disabled={isLoading} // Deaktiver input under loading
            className={errors.user_full_name ? "form-control input-error" : "form-control"}
          />
          <FieldError error={errors.user_full_name} />
        </div>
        <div className="form-group">
          <label>Username:</label>
          <span className="field-hint">3-20 chars · letters, numbers, underscores, dots</span>
          <input
            type="text"
            name="user_username"
            value={formData.user_username}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.user_username ? "form-control input-error" : "form-control"}
          />
          <FieldError error={errors.user_username} />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <span className="field-hint">Valid email · Max 100 characters</span>
          <input
            type="email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.user_email ? "form-control input-error" : "form-control"}
          />
          <FieldError error={errors.user_email} />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <span className="field-hint">Min. 8 characters</span>
          <input
            type="password"
            name="user_password"
            value={formData.user_password}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.user_password ? "form-control input-error" : "form-control"}
          />
          <FieldError error={errors.user_password} />
        </div>
        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>
      <p>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}

export default Signup;
