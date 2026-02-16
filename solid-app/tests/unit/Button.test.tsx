import { describe, it, expect, vi } from "vitest";
import { render } from "@solidjs/testing-library";
import Button from "@/components/base/Button";

describe("Button", () => {
  describe("variant classes", () => {
    it("renders with primary variant class by default", () => {
      const { getByRole } = render(() => <Button>Click me</Button>);
      const button = getByRole("button");
      expect(button).toHaveClass("button--primary");
    });

    it("renders with secondary variant class", () => {
      const { getByRole } = render(() => <Button variant="secondary">Click me</Button>);
      const button = getByRole("button");
      expect(button).toHaveClass("button--secondary");
    });

    it("renders with danger variant class", () => {
      const { getByRole } = render(() => <Button variant="danger">Delete</Button>);
      const button = getByRole("button");
      expect(button).toHaveClass("button--danger");
    });

    it("renders with ghost variant class", () => {
      const { getByRole } = render(() => <Button variant="ghost">Cancel</Button>);
      const button = getByRole("button");
      expect(button).toHaveClass("button--ghost");
    });
  });

  describe("size classes", () => {
    it("renders with md size class by default", () => {
      const { getByRole } = render(() => <Button>Click me</Button>);
      const button = getByRole("button");
      expect(button).toHaveClass("button--md");
    });

    it("renders with sm size class", () => {
      const { getByRole } = render(() => <Button size="sm">Small</Button>);
      const button = getByRole("button");
      expect(button).toHaveClass("button--sm");
    });

    it("renders with lg size class", () => {
      const { getByRole } = render(() => <Button size="lg">Large</Button>);
      const button = getByRole("button");
      expect(button).toHaveClass("button--lg");
    });
  });

  describe("disabled state", () => {
    it("renders as disabled when disabled prop is true", () => {
      const { getByRole } = render(() => <Button disabled>Disabled</Button>);
      const button = getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("button--disabled");
    });

    it("renders as enabled by default", () => {
      const { getByRole } = render(() => <Button>Enabled</Button>);
      const button = getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("click handler", () => {
    it("fires click handler when clicked", () => {
      const handleClick = vi.fn();
      const { getByRole } = render(() => <Button onClick={handleClick}>Click me</Button>);
      const button = getByRole("button");
      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not fire click handler when disabled", () => {
      const handleClick = vi.fn();
      const { getByRole } = render(() => (
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      ));
      const button = getByRole("button");
      button.click();
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});
