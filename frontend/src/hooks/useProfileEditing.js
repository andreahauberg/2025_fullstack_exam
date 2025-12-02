import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { extractFieldErrors, parseApiErrorMessage, validateFields } from "../utils/validation";

export const useProfileEditing = (user, setUser, setError) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user ?? {});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setEditedUser(user ?? {});
  }, [user]);

  const handleEdit = useCallback(() => {
    setFormErrors({});
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setFormErrors({});
    setIsEditing(false);
    setEditedUser(user ?? {});
  }, [user]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveEdit = useCallback(async () => {
    const clientErrors = validateFields(editedUser, ["user_full_name", "user_username", "user_email"]);
    if (Object.keys(clientErrors).length > 0) {
      setFormErrors(clientErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await api.put(`/users/${user?.user_pk}`, editedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setIsEditing(false);
      setFormErrors({});
    } catch (error) {
      const backendErrors = extractFieldErrors(error);
      if (Object.keys(backendErrors).length > 0) {
        setFormErrors(backendErrors);
      } else {
        setError?.(parseApiErrorMessage(error, "Failed to update user data."));
      }
    }
  }, [editedUser, setError, setFormErrors, setUser, user]);

  return {
    isEditing,
    editedUser,
    formErrors,
    setIsEditing,
    handleChange,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,
  };
};
