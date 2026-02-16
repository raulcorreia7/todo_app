import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@solidjs/testing-library";
import Input from "@/components/base/Input";

describe("Input", () => {
  describe("renders with value", () => {
    it("renders with initial value", () => {
      const { getByRole } = render(() => <Input value="Hello" />);
      const input = getByRole("textbox");
      expect(input).toHaveValue("Hello");
    });

    it("renders with empty value when not provided", () => {
      const { getByRole } = render(() => <Input />);
      const input = getByRole("textbox");
      expect(input).toHaveValue("");
    });
  });

  describe("onInput callback", () => {
    it("fires onInput callback on change", async () => {
      const handleInput = vi.fn();
      const { getByRole } = render(() => <Input onInput={handleInput} />);
      const input = getByRole("textbox");
      await fireEvent.input(input, { target: { value: "test" } });
      expect(handleInput).toHaveBeenCalled();
    });

    it("passes new value to onInput callback", async () => {
      const handleInput = vi.fn();
      const { getByRole } = render(() => <Input onInput={handleInput} />);
      const input = getByRole("textbox");
      await fireEvent.input(input, { target: { value: "a" } });
      expect(handleInput).toHaveBeenCalledWith("a");
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      const { getByRole } = render(() => <Input disabled />);
      const input = getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("renders as enabled by default", () => {
      const { getByRole } = render(() => <Input />);
      const input = getByRole("textbox");
      expect(input).not.toBeDisabled();
    });
  });

  describe("maxlength attribute", () => {
    it("renders with maxlength attribute", () => {
      const { getByRole } = render(() => <Input maxlength={10} />);
      const input = getByRole("textbox");
      expect(input).toHaveAttribute("maxlength", "10");
    });

    it("renders without maxlength attribute when not provided", () => {
      const { getByRole } = render(() => <Input />);
      const input = getByRole("textbox");
      expect(input).not.toHaveAttribute("maxlength");
    });
  });
});
