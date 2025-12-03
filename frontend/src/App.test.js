import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { MemoryRouter } from "react-router-dom";

test("renders the App component", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

const loginButton = screen.getByRole("button", { name: /log ind/i });
expect(loginButton).toBeInTheDocument();

});
