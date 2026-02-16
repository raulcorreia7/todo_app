import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
import Checkbox from "@/components/base/Checkbox";

describe("Checkbox", () => {
  describe("renders unchecked", () => {
    it("renders with aria-checked false when unchecked", () => {
      const { getByRole } = render(() => <Checkbox checked={false} />);
      const checkbox = getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "false");
    });

    it("does not have checked class when unchecked", () => {
      const { getByRole } = render(() => <Checkbox checked={false} />);
      const checkbox = getByRole("checkbox");
      expect(checkbox).not.toHaveClass("checkbox--checked");
    });
  });

  describe("renders checked", () => {
    it("renders with aria-checked true when checked", () => {
      const { getByRole } = render(() => <Checkbox checked={true} />);
      const checkbox = getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("has checked class when checked", () => {
      const { getByRole } = render(() => <Checkbox checked={true} />);
      const checkbox = getByRole("checkbox");
      expect(checkbox).toHaveClass("checkbox--checked");
    });
  });

  describe("onChange fires when clicked", () => {
    it("fires onChange with true when unchecked checkbox is clicked", async () => {
      const handleChange = vi.fn();
      const { getByRole } = render(() => <Checkbox checked={false} onChange={handleChange} />);
      const checkbox = getByRole("checkbox");
      await fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("fires onChange with false when checked checkbox is clicked", async () => {
      const handleChange = vi.fn();
      const { getByRole } = render(() => <Checkbox checked={true} onChange={handleChange} />);
      const checkbox = getByRole("checkbox");
      await fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false);
    });
  });

  describe("disabled state", () => {
    it("renders with disabled class when disabled", () => {
      const { getByRole } = render(() => <Checkbox disabled />);
      const checkbox = getByRole("checkbox");
      expect(checkbox).toHaveClass("checkbox--disabled");
    });

    it("has tabindex -1 when disabled", () => {
      const { getByRole } = render(() => <Checkbox disabled />);
      const checkbox = getByRole("checkbox");
      expect(checkbox).toHaveAttribute("tabindex", "-1");
    });

    it("does not fire onChange when disabled and clicked", async () => {
      const handleChange = vi.fn();
      const { getByRole } = render(() => <Checkbox disabled onChange={handleChange} />);
      const checkbox = getByRole("checkbox");
      await fireEvent.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("has tabindex 0 when not disabled", () => {
      const { getByRole } = render(() => <Checkbox />);
      const checkbox = getByRole("checkbox");
      expect(checkbox).toHaveAttribute("tabindex", "0");
    });
  });
});
