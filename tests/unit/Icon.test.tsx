import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import Icon from "@/components/base/Icon";

describe("Icon", () => {
  it("renders emoji icons for affirmation notifications", () => {
    render(() => <Icon name="🌸" size={20} />);
    expect(screen.getByText("🌸")).toBeInTheDocument();
  });

  it("renders nothing for unknown non-emoji icon names", () => {
    const { container } = render(() => (
      <Icon name="not-a-real-icon" size={20} />
    ));
    expect(container).toBeEmptyDOMElement();
  });
});
