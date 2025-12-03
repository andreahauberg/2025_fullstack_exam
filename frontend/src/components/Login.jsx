import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { validateFields, parseApiErrorMessage } from "../utils/validation";
import FieldError from "./FieldError";

function Login() {
  const { login } = useAuth();

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
      const result = await login(formData);

      if (!result.success) {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          const msg = result.message || "Invalid login credentials.";
          setErrors({
            user_email: msg,
            user_password: msg,
          });
        }
      }
    } catch (error) {
      const fallback = parseApiErrorMessage(error, "Login failed.");
      setErrors({
        user_email: fallback,
        user_password: fallback,
      });
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
          {isLoading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default Login;
