import { useAuthContext } from "../context/AuthContext";

export const useAuth = (_options = {}) => {
  return useAuthContext();
};
