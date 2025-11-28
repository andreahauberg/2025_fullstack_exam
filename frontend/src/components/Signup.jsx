import React, { useState } from "react";
import { api } from "../api"; // Importer den centrale api-instans
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    user_full_name: "",
    user_username: "",
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
    setIsLoading(true); // Aktiver loading
    try {
      const response = await api.post("/signup", formData); // Brug api-instansen
      setMessage(response.data.message);
      setErrors({});
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response) {
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else if (error.response.data.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage("An unexpected error occurred.");
        }
      } else {
        setMessage("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false); // Deaktiver loading
    }
  };

  return (
    <div className="signup-container">
      <h2>Create your account</h2>
      {message && (
        <div
          className={`alert ${
            message.includes("success") ? "alert-success" : "alert-error"
          }`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="user_full_name"
            value={formData.user_full_name}
            onChange={handleChange}
            required
            disabled={isLoading} // Deaktiver input under loading
          />
          {errors.user_full_name && (
            <span className="error">{errors.user_full_name[0]}</span>
          )}
        </div>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="user_username"
            value={formData.user_username}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          {errors.user_username && (
            <span className="error">{errors.user_username[0]}</span>
          )}
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            required
            disabled={isLoading}
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
