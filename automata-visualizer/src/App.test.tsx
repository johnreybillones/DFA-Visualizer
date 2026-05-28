import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import App from "./App";

vi.mock("./components/GraphCanvas", () => ({
  GraphCanvas: () => <div data-testid="graph-canvas" />,
}));

vi.mock("./components/TracePanel", () => ({
  TracePanel: () => <div data-testid="trace-panel" />,
}));

describe("App custom string workflow", () => {
  test("clicking a saved custom string activates it and starts playback", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.type(screen.getByLabelText("String 1"), "abba");
    await user.click(screen.getByRole("button", { name: "Run custom string 1: abba" }));

    expect(screen.getByLabelText("Test string for alphabet a, b")).toHaveValue("abba");
    expect(screen.getByText(/Consumed 0 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Running" })).toBeInTheDocument();
  });
});
