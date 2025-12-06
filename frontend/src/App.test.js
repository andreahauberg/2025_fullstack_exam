import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import LandingPage from "./Pages/LandingPage";
import HomePage from "./Pages/HomePage";
import ProfilePage from "./Pages/ProfilePage";
import NotificationsPage from "./Pages/NotificationsPage";
import UserPage from "./Pages/UserPage";
import NotFoundPage from "./Pages/NotFoundPage";
import ErrorPage from "./Pages/ErrorPage";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  };

// ----- MOCK AXIOS ----
jest.mock("axios", () => {
  const mockAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  mockAxios.create = jest.fn(() => mockAxios);
  return mockAxios;
});

// ---- MOCK API RESPONSES ----
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("token", "test-token");
  const axios = require("axios");
  axios.get.mockImplementation((url) => {
    // ---- USER PROFILE ----
    if (url.includes("/users/testuser")) {
      return Promise.resolve({
        data: {
          user: {
            user_pk: "user123",
            user_username: "testuser",
            user_full_name: "Test User",
            user_profile_picture: null,
            user_cover_picture: null,
            posts_count: 0,
            followers_count: 0,
            following_count: 0,
            reposts_count: 0,
          },
          followers: [],
          following: [],
        },
      });
    }
    // ---- REPOSTS ----
    if (url.includes("/users/testuser/reposts")) {
      return Promise.resolve({
        data: [],
        current_page: 1,
        last_page: 1,
      });
    }
    // ---- TRENDING ----
    if (url.includes("/trending")) {
      return Promise.resolve({ data: [] });
    }
    // ---- USERS TO FOLLOW ----
    if (url.includes("/users-to-follow")) {
      return Promise.resolve({ data: [] });
    }
    // ---- CURRENT USER ----
    if (url === "/api/user") {
      return Promise.resolve({
        data: {
          user_pk: "user123",
          user_username: "testuser",
          user_full_name: "Test User",
          user_email: "test@example.com",
        },
      });
    }
    // ---- OTHER APIS ----
    if (url.includes("/api/posts")) {
      return Promise.resolve({ data: [] });
    }
    if (url.includes("/api/notifications")) {
      return Promise.resolve({
        data: [],
        meta: { unread_count: 0 },
      });
    }
    return Promise.resolve({ data: {} });
  });
});

// Helper function to render with router
const renderWithRouter = (
  ui,
  { route = "/", initialEntries = [route] } = {}
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
  );
};

describe("App routing", () => {
  describe("Public routes", () => {
    beforeEach(() => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return null;
        return null;
      });
    });
    test("renders LandingPage by default", async () => {
      renderWithRouter(<App />, { route: "/" });
      await waitFor(() => {
        expect(screen.getByTestId("landing-page")).toBeInTheDocument();
      });
    });
    test("renders NotFoundPage for unknown routes", async () => {
      renderWithRouter(<App />, { route: "/unknown-route" });
      await waitFor(() => {
        expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
      });
    });
    test("renders ErrorPage", async () => {
      renderWithRouter(<App />, { route: "/error" });
      await waitFor(() => {
        expect(screen.getByTestId("error-page")).toBeInTheDocument();
      });
    });
  });

  describe("Protected routes", () => {
    beforeEach(() => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return "fake-token";
        if (key === "user_pk") return "user123";
        if (key === "user_username") return "testuser";
        return null;
      });
    });
    test("renders HomePage when authenticated", async () => {
      renderWithRouter(<App />, { route: "/home" });
      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });
    });
    test("renders NotificationsPage when authenticated", async () => {
      renderWithRouter(<App />, { route: "/notifications" });
      await waitFor(() => {
        expect(screen.getByTestId("notifications-page")).toBeInTheDocument();
      });
    });
    test("renders ProfilePage when authenticated", async () => {
      renderWithRouter(<App />, { route: "/profile/testuser" });
      await waitFor(
        () => {
          expect(screen.getByTestId("profile-page")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
    test("renders UserPage when authenticated", async () => {
      renderWithRouter(<App />, { route: "/user/testuser" });
      await waitFor(
        () => {
          expect(screen.getByTestId("user-page")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
    test("redirects to landing page when not authenticated", async () => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return null;
        return null;
      });
      renderWithRouter(<App />, { route: "/home" });
      await waitFor(() => {
        expect(screen.getByTestId("landing-page")).toBeInTheDocument();
      });
    });
    test("redirects to home page when authenticated and trying to access landing page", async () => {
      renderWithRouter(<App />, { route: "/" });
      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });
    });
  });

  describe("Individual page tests", () => {
    test("LandingPage renders correctly", () => {
      render(
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      );
      expect(screen.getByTestId("landing-page")).toBeInTheDocument();
    });
    test("HomePage renders correctly", async () => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return "fake-token";
        if (key === "user_pk") return "user123";
        if (key === "user_username") return "testuser";
        return null;
      });
      render(
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
      });
    });
    test("ProfilePage renders correctly", async () => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return "fake-token";
        if (key === "user_pk") return "user123";
        if (key === "user_username") return "testuser";
        return null;
      });
      render(
        <MemoryRouter initialEntries={["/profile/testuser"]}>
          <Routes>
            <Route path="/profile/:username" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(
        () => {
          expect(screen.getByTestId("profile-page")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
    test("NotificationsPage renders correctly", async () => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return "fake-token";
        if (key === "user_pk") return "user123";
        if (key === "user_username") return "testuser";
        return null;
      });
      render(
        <MemoryRouter>
          <NotificationsPage />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByTestId("notifications-page")).toBeInTheDocument();
      });
    });
    test("UserPage renders correctly", async () => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === "token") return "fake-token";
        if (key === "user_pk") return "user123";
        if (key === "user_username") return "testuser";
        return null;
      });
      render(
        <MemoryRouter initialEntries={["/user/testuser"]}>
          <Routes>
            <Route path="/user/:username" element={<UserPage />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(
        () => {
          expect(screen.getByTestId("user-page")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
    test("NotFoundPage renders correctly", () => {
      render(
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      );
      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
    });
    test("ErrorPage renders correctly", () => {
      render(
        <MemoryRouter initialEntries={["/error?code=404"]}>
          <ErrorPage />
        </MemoryRouter>
      );
      expect(screen.getByTestId("error-page")).toBeInTheDocument();
    });
  });
});
