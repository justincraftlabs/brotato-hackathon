import { formatVnd, formatKwh, formatPercent, formatCo2 } from "./format";

describe("formatVnd", () => {
  it("formats positive integers with the đ suffix", () => {
    const result = formatVnd(1000000);
    expect(result).toContain("\u0111");
    expect(result).toMatch(/1/);
  });

  it("rounds decimals to the nearest integer", () => {
    expect(formatVnd(1234.7)).toContain("1.235");
  });
});

describe("formatKwh", () => {
  it("rounds to one decimal place", () => {
    expect(formatKwh(12.345)).toBe("12.3 kWh");
  });

  it("handles zero", () => {
    expect(formatKwh(0)).toBe("0 kWh");
  });
});

describe("formatPercent", () => {
  it("prepends a plus sign for positive values", () => {
    expect(formatPercent(12)).toBe("+12%");
  });

  it("omits a plus sign for zero or negative values", () => {
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(-5)).toBe("-5%");
  });
});

describe("formatCo2", () => {
  it("rounds to 1 decimal and appends kg CO₂", () => {
    expect(formatCo2(3.456)).toContain("3.5");
    expect(formatCo2(3.456)).toContain("CO\u2082");
  });
});
