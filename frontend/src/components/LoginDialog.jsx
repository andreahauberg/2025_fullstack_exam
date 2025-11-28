import { useState } from "react";
import { api } from "../api";
import Dialog from "./Dialog";

const LoginDialog = ({ isOpen, onClose, onSuccess, onOpenSignup }) => {
  const [formData, setFormData] = useState({
    user_email: "",
    user_password: "",
  });
  const [message, setMessage] = useState("");
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
    setIsLoading(true);
    try {
      const response = await api.post("/login", formData);
      setMessage(response.data.message);
      setErrors({});
      localStorage.setItem("token", response.data.token); // Gem token
      localStorage.setItem("user_pk", response.data.user.user_pk); // Gem bruger PK
      setTimeout(() => {
        onSuccess();
        onClose();
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Log in" logo={true}>
      {message && (
        <div
          className={`alert ${
            message.includes("success") ? "alert-success" : "alert-error"
          }`}>
          {message}
        </div>
      )}
      <form className="x-dialog__form" onSubmit={handleSubmit}>
        <input
          name="user_email"
          type="email"
          placeholder="Email"
          value={formData.user_email}
          onChange={handleChange}
          required
          disabled={isLoading}
          autoFocus
        />
        {errors.user_email && (
          <span className="error">{errors.user_email[0]}</span>
        )}

        <input
          name="user_password"
          type="password"
          placeholder="Password"
          value={formData.user_password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
        {errors.user_password && (
          <span className="error">{errors.user_password[0]}</span>
        )}

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
