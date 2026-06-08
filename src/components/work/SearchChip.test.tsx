import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SearchChip } from "./SearchChip";

/** i18n stub: echoes the key so assertions can target stable labels. */
const label = (k: string) => k;

/**
 * SearchChip's `value` is parent-controlled, so collapse-on-clear can only be
 * exercised through a host that owns the state — mirroring how ProjectLog wires
 * it. `onChange`/`onClear` spies are layered on top to assert the callbacks.
 */
function Harness({ onChange, onClear }: { onChange: () => void; onClear: () => void }) {
  const [value, setValue] = useState("");
  return (
    <SearchChip
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange();
      }}
      onClear={() => {
        setValue("");
        onClear();
      }}
      label={label}
    />
  );
}

describe("<SearchChip>", () => {
  it("calls onChange for every keystroke once expanded", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} onClear={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "search.open" }));
    await user.type(screen.getByRole("textbox", { name: "search.label" }), "weather");

    expect(onChange).toHaveBeenCalledTimes("weather".length);
  });

  it("clears the value and collapses back to the icon on ×", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Harness onChange={vi.fn()} onClear={onClear} />);

    await user.click(screen.getByRole("button", { name: "search.open" }));
    await user.type(screen.getByRole("textbox", { name: "search.label" }), "weather");
    await user.click(screen.getByRole("button", { name: "search.clear" }));

    expect(onClear).toHaveBeenCalledTimes(1);
    // Collapsed: the field is gone and the icon button is back.
    expect(screen.queryByRole("textbox", { name: "search.label" })).toBeNull();
    expect(screen.getByRole("button", { name: "search.open" })).toBeInTheDocument();
  });
});
