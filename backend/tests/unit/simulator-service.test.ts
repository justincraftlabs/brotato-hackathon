import { createHome, addAppliances } from '../../src/services/home-service';
import { calculateSimulation } from '../../src/services/simulator-service';

async function setupHome() {
  const home = await createHome([
    { name: 'Living Room', type: 'living_room', size: 'medium' },
  ]);
  const room = home.rooms[0]!;
  const appliances = await addAppliances(home.homeId, room.roomId, [
    {
      name: 'Air Conditioner',
      type: 'cooling',
      wattage: 1000,
      dailyUsageHours: 8,
      standbyWattage: 0,
      usageHabit: '',
    },
  ]);
  return { home, appliances };
}

describe('simulator-service', () => {
  it('returns null when the home does not exist', async () => {
    const result = await calculateSimulation('missing-home-id', []);
    expect(result).toBeNull();
  });

  it('produces identical original and simulated values when no adjustments provided', async () => {
    const { home } = await setupHome();

    const result = await calculateSimulation(home.homeId, []);

    expect(result).not.toBeNull();
    expect(result!.original.monthlyKwh).toBeCloseTo(result!.simulated.monthlyKwh);
    expect(result!.delta.kwhSaved).toBeCloseTo(0);
    expect(result!.delta.costSaved).toBe(0);
  });

  it('reports positive savings when daily hours are reduced', async () => {
    const { home, appliances } = await setupHome();
    const ac = appliances[0]!;

    const result = await calculateSimulation(home.homeId, [
      { applianceId: ac.applianceId, newDailyHours: 4 },
    ]);

    expect(result).not.toBeNull();
    expect(result!.simulated.monthlyKwh).toBeLessThan(result!.original.monthlyKwh);
    expect(result!.delta.kwhSaved).toBeGreaterThan(0);
    expect(result!.delta.co2Saved).toBeGreaterThan(0);
    expect(result!.delta.treesEquivalent).toBeGreaterThan(0);
  });

  it('classifies >20% reduction as high impact', async () => {
    const { home, appliances } = await setupHome();
    const ac = appliances[0]!;

    const result = await calculateSimulation(home.homeId, [
      { applianceId: ac.applianceId, newDailyHours: 1 },
    ]);

    const perAppliance = result!.perAppliance[0]!;
    expect(perAppliance.impact).toBe('high');
  });

  it('temperature adjustment on cooling appliances changes consumption', async () => {
    const { home, appliances } = await setupHome();
    const ac = appliances[0]!;

    const cooler = await calculateSimulation(home.homeId, [
      { applianceId: ac.applianceId, newTemperature: 20 },
    ]);
    const warmer = await calculateSimulation(home.homeId, [
      { applianceId: ac.applianceId, newTemperature: 28 },
    ]);

    expect(cooler!.simulated.monthlyKwh).toBeGreaterThan(
      warmer!.simulated.monthlyKwh
    );
  });
});
