import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Dialog from "./Dialog";
import { parseApiErrorMessage, validateFields } from "../utils/validation";
import FieldError from "./FieldError";

const LoginDialog = ({ isOpen, onClose, onSuccess, onOpenSignup }) => {
  const [formData, setFormData] = useState({
    user_email: "",
    user_password: "",
  });
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
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
      const result = await login(formData);

      if (result.success) {
        setErrors({});
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
        return;
      }

      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors);
      } else {
        const fallback =
          result.message || "Login failed. Please check your credentials.";
        setErrors({
          user_email: fallback,
          user_password: fallback,
        });
      }
    } catch (error) {
      const fallback = parseApiErrorMessage(
        error,
        "Network error. Please check your connection."
      );
      setErrors({
        user_email: fallback,
        user_password: fallback,
      });
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
