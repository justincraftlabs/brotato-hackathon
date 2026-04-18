import { cn } from "./utils";

describe("cn (tailwind class merger)", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false, null, undefined, "py-1")).toBe("px-2 py-1");
  });

  it("resolves conflicting Tailwind utilities via tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("supports conditional objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });
});
