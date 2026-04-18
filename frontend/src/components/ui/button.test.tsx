import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("fires onClick when the user clicks it", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Confirm</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    await userEvent.click(screen.getByRole("button", { name: "Disabled" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies the variant class when a variant is passed", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toMatch(/destructive/);
  });

  it("renders as a child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>
    );

    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "href",
      "/docs"
    );
  });
});
