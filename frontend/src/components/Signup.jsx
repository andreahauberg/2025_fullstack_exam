import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { validateFields, parseApiErrorMessage } from "../utils/validation";
import FieldError from "./FieldError";

function Signup() {
  const { signup } = useAuth();

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

    const clientErrors = validateFields(formData, [
      "user_full_name",
      "user_username",
      "user_email",
      "user_password",
    ]);

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(formData);

      if (!result.success) {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          const msg = result.message || "Signup failed.";
          setErrors({
            user_full_name: msg,
            user_username: msg,
            user_email: msg,
            user_password: msg,
          });
        }
      }
    } catch (err) {
      const fallback = parseApiErrorMessage(err, "Signup failed.");
      setErrors({
        user_full_name: fallback,
        user_username: fallback,
        user_email: fallback,
        user_password: fallback,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create your account</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="user_full_name"
            value={formData.user_full_name}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.user_full_name ? "form-control input-error" : "form-control"}
          />
          <FieldError error={errors.user_full_name} />
        </div>

        <div className="form-group">
          <label>Username:</label>
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

        <button className="btn" type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}

export default Signup;
