import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppProvider } from "../state/AppContext";
import { App } from "../App";

describe("App", () => {
  it("renders login navigation", () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("ログイン")).toBeInTheDocument();
  });
});
