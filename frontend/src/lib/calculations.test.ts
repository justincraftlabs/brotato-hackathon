import {
  calculateMonthlyKwh,
  calculateMonthlyCost,
  calculateCo2,
  calculateTemperatureFactor,
} from "./calculations";
import { EVN_TIERS, CO2_EMISSION_FACTOR } from "./constants";

describe("calculateMonthlyKwh", () => {
  it("returns 0 kWh for 0 wattage", () => {
    expect(calculateMonthlyKwh(0, 10)).toBe(0);
  });

  it("calculates kWh with the (W/1000) * hours * 30 formula", () => {
    expect(calculateMonthlyKwh(1000, 1)).toBe(30);
    expect(calculateMonthlyKwh(500, 2)).toBe(30);
  });
});

describe("calculateMonthlyCost", () => {
  it("returns 0 cost for 0 kWh", () => {
    expect(calculateMonthlyCost(0)).toBe(0);
  });

  it("uses only tier 1 rate for usage under 50 kWh", () => {
    const tier1 = EVN_TIERS[0]!;
    expect(calculateMonthlyCost(30)).toBeCloseTo(30 * tier1.pricePerKwh);
  });

  it("applies progressive tier rates across thresholds", () => {
    const tier1 = EVN_TIERS[0]!;
    const tier2 = EVN_TIERS[1]!;
    const expected = 50 * tier1.pricePerKwh + 30 * tier2.pricePerKwh;
    expect(calculateMonthlyCost(80)).toBeCloseTo(expected);
  });

  it("is monotonically increasing", () => {
    expect(calculateMonthlyCost(500)).toBeGreaterThan(
      calculateMonthlyCost(400)
    );
  });
});

describe("calculateCo2", () => {
  it("multiplies kWh by the CO2 emission factor", () => {
    expect(calculateCo2(10)).toBeCloseTo(10 * CO2_EMISSION_FACTOR);
  });
});

describe("calculateTemperatureFactor", () => {
  it("returns 1 for non-temperature appliances", () => {
    expect(calculateTemperatureFactor("lighting", 20)).toBe(1);
  });

  it("cooling at baseline temperature has factor ~1.0", () => {
    expect(calculateTemperatureFactor("cooling", 25)).toBeCloseTo(1);
  });

  it("cooler target for cooling increases the factor", () => {
    expect(calculateTemperatureFactor("cooling", 20)).toBeGreaterThan(1);
  });

  it("warmer target for cooling decreases the factor", () => {
    expect(calculateTemperatureFactor("cooling", 30)).toBeLessThan(1);
  });

  it("heating at baseline temperature has factor ~1.0", () => {
    expect(calculateTemperatureFactor("heating", 45)).toBeCloseTo(1);
  });
});
