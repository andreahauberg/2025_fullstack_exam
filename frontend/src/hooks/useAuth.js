// src/hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import { parseApiErrorMessage } from "../utils/validation";

export const useAuth = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const fetchAuthenticatedUser = useCallback(async () => {
    try {
      const response = await api.get("/user");

      if (response?.data) {
        setUser(response.data);

        localStorage.setItem("user_pk", response.data.user_pk);
        localStorage.setItem("user_username", response.data.user_username);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("user_pk");
        localStorage.removeItem("user_username");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true);

        await api.get("/sanctum/csrf-cookie");

        const response = await api.post("/login", credentials);

        if (response.data?.success) {
          const loggedInUser = response.data.user;

          setUser(loggedInUser);
          localStorage.setItem("user_pk", loggedInUser.user_pk);
          localStorage.setItem("user_username", loggedInUser.user_username);

          return { success: true };
        } else {
          return {
            success: false,
            message: response.data?.message || "Authentication failed.",
          };
        }
      } catch (error) {
        return {
          success: false,
          message: parseApiErrorMessage(error, "Login failed."),
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signup = useCallback(async (formData) => {
    try {
      setLoading(true);

      await api.get("/sanctum/csrf-cookie");

      const response = await api.post("/signup", formData);

      if (response.data.success) {
        const newUser = response.data.user;
        setUser(newUser);

        localStorage.setItem("user_pk", newUser.user_pk);
        localStorage.setItem("user_username", newUser.user_username);

        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: parseApiErrorMessage(error, "Signup failed."),
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch (err) {
    }

    setUser(null);
    localStorage.removeItem("user_pk");
    localStorage.removeItem("user_username");

    navigate("/");
  }, [navigate]);

  return {
    user,
    loading,
    authError,
    login,
    signup,
    logout,
    refreshUser: fetchAuthenticatedUser,
    isAuthenticated: !!user,
  };
};