import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { MemoryRouter } from "react-router-dom";

test("renders the LandingPage by default", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  // Tjek om indhold fra LandingPage renderes
  // Eksempel: Tjek om der er en "Welcome"-tekst eller en login-knap i LandingPage
  const nowElement = screen.getByText(/now/i); // Juster dette til at matche tekst i din LandingPage
  expect(nowElement).toBeInTheDocument();
});
