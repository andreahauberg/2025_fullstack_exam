import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { MemoryRouter } from "react-router-dom";


jest.mock("axios", () => {
  const mockAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(function () {
      // create() returnerer et axios-lignende objekt
      return mockAxios;
    }),
  };
  return mockAxios;
});


beforeEach(() => {
  // Mock localStorage for at simulere en ikke-logget-ind bruger
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === "token") return null; // Simulerer ingen token (ikke logget ind)
    return null;
  });
});

test("renders the LandingPage by default", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  // Vent på, at LandingPage indholdet er tilgængeligt
  await waitFor(() => {
    const landingElement = screen.getByTestId("landing-page");
    expect(landingElement).toBeInTheDocument();
  });
});
