import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import HomePage from "./Pages/HomePage";
import ProfilePage from "./Pages/ProfilePage";
import NotificationsPage from "./Pages/NotificationsPage";
import UserPage from "./Pages/UserPage";
import ErrorPage from "./Pages/ErrorPage";
import ErrorBoundary from "./components/ErrorBoundary";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/home" replace /> : children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
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

          <Route
            path="/user/:username"
            element={
              <ProtectedRoute>
                <UserPage />
              </ProtectedRoute>
            }
          />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />

        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;