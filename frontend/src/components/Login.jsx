import React, { useState } from "react";
import { api } from "../api"; // Importer den centrale api-instans
import { useNavigate } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    user_email: "",
    user_password: "",
  });
  const [message, setMessage] = useState("");
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
  setIsLoading(true);
  try {
    const response = await api.post("/login", formData);
    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_pk", response.data.user.user_pk);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } else {
      setMessage(response.data.message || "Login failed.");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Invalid credentials.");
      }
    } else {
      setMessage("Network error. Please check your connection.");
    }
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="login-container">
      <h2>Log in</h2>
      {message && <div className="alert">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            required
            disabled={isLoading} // Deaktiver input under loading
          />
          {errors.user_email && (
            <span className="error">{errors.user_email[0]}</span>
          )}
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="user_password"
            value={formData.user_password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {errors.user_password && (
            <span className="error">{errors.user_password[0]}</span>
          )}
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
