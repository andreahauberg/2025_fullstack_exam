import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import {
  extractFieldErrors,
  parseApiErrorMessage,
  validateFields,
} from "../utils/validation";

export const useProfileEditing = (user, setUser, setError) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(() => user ?? {});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isEditing) {
      setEditedUser(user ?? {});
    }
  }, [user, isEditing]);

  const handleEdit = useCallback(() => {
    setFormErrors({});
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setFormErrors({});
    setEditedUser(user ?? {});
  }, [user]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditedUser((prev) => {
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    const validationErrors = validateFields(editedUser, [
      "user_full_name",
      "user_username",
      "user_email",
    ]);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/users/${user?.user_pk}`, editedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data?.user ?? response.data);

      setIsEditing(false);
      setFormErrors({});
    } catch (error) {
      const backendErrors = extractFieldErrors(error);

      if (Object.keys(backendErrors).length > 0) {
        setFormErrors(backendErrors);
        return;
      }

      setError?.(
        parseApiErrorMessage(error, "Failed to update profile information.")
      );
    }
  }, [editedUser, setUser, setError, user]);

  return {
    isEditing,
    editedUser,
    formErrors,
    handleChange,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
  };
};