import {
  calculateApplianceMonthlyKwh,
  calculateApplianceMonthlyKwhForRoom,
  calculateMonthlyCost,
  calculateSizeFactor,
  getCurrentTier,
} from '../../src/services/evn-pricing-service';
import { EVN_TIERS } from '../../src/constants/evn-tiers';

describe('evn-pricing-service', () => {
  describe('calculateApplianceMonthlyKwh', () => {
    it('returns 0 kWh when wattage is 0', () => {
      expect(calculateApplianceMonthlyKwh(0, 10)).toBe(0);
    });

    it('calculates kWh = (W/1000) * hours * 30 days', () => {
      expect(calculateApplianceMonthlyKwh(1000, 1)).toBe(30);
      expect(calculateApplianceMonthlyKwh(500, 2)).toBe(30);
    });
  });

  describe('calculateSizeFactor', () => {
    it('returns neutral factor for non-area-sensitive appliances', () => {
      expect(calculateSizeFactor('lighting', 'lighting')).toBe(1);
    });

    it('scales up for large cooling rooms', () => {
      const factor = calculateSizeFactor('large', 'cooling');
      expect(factor).toBeGreaterThan(1);
    });

    it('scales down for small cooling rooms', () => {
      const factor = calculateSizeFactor('small', 'cooling');
      expect(factor).toBeLessThan(1);
    });

    it('clamps within [0.5, 2.0] bounds', () => {
      const factor = calculateSizeFactor('large', 'heating');
      expect(factor).toBeLessThanOrEqual(2.0);
      expect(factor).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('calculateApplianceMonthlyKwhForRoom', () => {
    it('applies size factor for cooling appliances', () => {
      const small = calculateApplianceMonthlyKwhForRoom(1000, 1, 'small', 'cooling');
      const large = calculateApplianceMonthlyKwhForRoom(1000, 1, 'large', 'cooling');
      expect(large).toBeGreaterThan(small);
    });

    it('does not apply size factor for lighting', () => {
      const small = calculateApplianceMonthlyKwhForRoom(1000, 1, 'small', 'lighting');
      const large = calculateApplianceMonthlyKwhForRoom(1000, 1, 'large', 'lighting');
      expect(small).toBe(large);
    });
  });

  describe('calculateMonthlyCost', () => {
    it('returns 0 for 0 kWh', () => {
      expect(calculateMonthlyCost(0)).toBe(0);
    });

    it('uses only tier 1 rate when consumption <= 50 kWh', () => {
      const tier1 = EVN_TIERS[0]!;
      expect(calculateMonthlyCost(30)).toBe(Math.round(30 * tier1.ratePerKwh));
    });

    it('applies tiered pricing across multiple tiers', () => {
      const tier1 = EVN_TIERS[0]!;
      const tier2 = EVN_TIERS[1]!;
      const expected = Math.round(50 * tier1.ratePerKwh + 30 * tier2.ratePerKwh);
      expect(calculateMonthlyCost(80)).toBe(expected);
    });

    it('returns a monotonically increasing cost for increasing kWh', () => {
      expect(calculateMonthlyCost(200)).toBeGreaterThan(calculateMonthlyCost(100));
      expect(calculateMonthlyCost(500)).toBeGreaterThan(calculateMonthlyCost(400));
    });
  });

  describe('getCurrentTier', () => {
    it('places 30 kWh in tier 1', () => {
      const info = getCurrentTier(30);
      expect(info.current).toBe(1);
    });

    it('places 250 kWh in tier 4', () => {
      const info = getCurrentTier(250);
      expect(info.current).toBe(4);
    });

    it('returns the highest tier for usage above all thresholds', () => {
      const info = getCurrentTier(10000);
      expect(info.current).toBe(6);
      expect(info.nextThreshold).toBe(Infinity);
    });
  });
});
