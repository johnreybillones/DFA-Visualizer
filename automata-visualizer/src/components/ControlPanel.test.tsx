import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { ControlPanel } from "./ControlPanel";

describe("ControlPanel", () => {
  test("renders five custom string inputs and updates the targeted slot", async () => {
    const onCustomInputChange = vi.fn();

    render(
      <ControlPanel
        alphabet={["a", "b"]}
        customInputs={["", "", "", "", ""]}
        error={null}
        examples={{ accepted: ["ab"], rejected: ["ba"] }}
        input=""
        playbackMode="idle"
        speed={1200}
        onCustomInputChange={onCustomInputChange}
        onCustomInputRun={vi.fn()}
        onExampleClick={vi.fn()}
        onInputChange={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
        onRun={vi.fn()}
        onSpeedChange={vi.fn()}
        onStep={vi.fn()}
        onValidate={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("String 1")).toBeInTheDocument();
    expect(screen.getByLabelText("String 2")).toBeInTheDocument();
    expect(screen.getByLabelText("String 3")).toBeInTheDocument();
    expect(screen.getByLabelText("String 4")).toBeInTheDocument();
    expect(screen.getByLabelText("String 5")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("String 3"), {
      target: { value: "abba" },
    });

    expect(onCustomInputChange).toHaveBeenLastCalledWith(2, "abba");
  });

  test("renders non-empty custom strings as clickable run buttons", async () => {
    const user = userEvent.setup();
    const onCustomInputRun = vi.fn();

    render(
      <ControlPanel
        alphabet={["0", "1"]}
        customInputs={["010", "", "111", "   ", "001"]}
        error={null}
        examples={{ accepted: ["010"], rejected: ["111"] }}
        input=""
        playbackMode="idle"
        speed={1200}
        onCustomInputChange={vi.fn()}
        onCustomInputRun={onCustomInputRun}
        onExampleClick={vi.fn()}
        onInputChange={vi.fn()}
        onPause={vi.fn()}
        onReset={vi.fn()}
        onRun={vi.fn()}
        onSpeedChange={vi.fn()}
        onStep={vi.fn()}
        onValidate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Run custom string 1: 010" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run custom string 2: 111" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run custom string 3: 001" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Run custom string 4/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Run custom string 2: 111" }));

    expect(onCustomInputRun).toHaveBeenCalledWith("111");
  });
});
