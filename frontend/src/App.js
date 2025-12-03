import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import HomePage from "./Pages/HomePage";
import ProfilePage from "./Pages/ProfilePage";
import NotificationsPage from "./Pages/NotificationsPage";
import UserPage from "./Pages/UserPage";
import NotFoundPage from "./Pages/NotFoundPage";
import ErrorPage from "./Pages/ErrorPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (!loading && !isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (!loading && isAuthenticated) {
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:username"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/error" element={<ErrorPage />} />
      <Route
        path="/user/:username"
        element={
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        }
      />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
};

export default App;
