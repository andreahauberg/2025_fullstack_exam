import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { parseApiErrorMessage } from "../utils/validation";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/user");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true);

        await api.get("/sanctum/csrf-cookie");
        const res = await api.post("/api/login", credentials);

        if (res.data.success) {
          await fetchUser();
          return { success: true };
        }

        return { success: false, message: res.data.message };
      } catch (error) {
        const fieldErrors = error?.response?.data?.errors;
        if (fieldErrors) {
          return {
            success: false,
            errors: fieldErrors,
            message: error?.response?.data?.message,
          };
        }

        return {
          success: false,
          message: parseApiErrorMessage(error, "Login failed."),
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchUser]
  );

  const signup = useCallback(
    async (formData) => {
      try {
        setLoading(true);

        await api.get("/sanctum/csrf-cookie");
        const res = await api.post("/api/signup", formData);

        if (res.data.success) {
          await fetchUser();
          return { success: true };
        }

        return { success: false, message: res.data.message };
      } catch (error) {
        const fieldErrors = error?.response?.data?.errors;
        if (fieldErrors) {
          return {
            success: false,
            errors: fieldErrors,
            message: error?.response?.data?.message,
          };
        }

        return {
          success: false,
          message: parseApiErrorMessage(error, "Signup failed."),
        };
      } finally {
        setLoading(false);
      }
    },
    [fetchUser]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/logout");
    } catch {}

    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser: fetchUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
