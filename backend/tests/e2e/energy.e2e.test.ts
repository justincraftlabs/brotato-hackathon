import request from 'supertest';
import { createTestApp } from '../test-app';

const app = createTestApp();

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;

async function seedHome(): Promise<string> {
  const setup = await request(app)
    .post('/api/home/setup')
    .send({
      rooms: [{ name: 'Living Room', type: 'living_room', size: 'medium' }],
    });
  const homeId = setup.body.data.homeId as string;
  const roomId = setup.body.data.rooms[0].roomId as string;

  await request(app)
    .post(`/api/home/${homeId}/appliances`)
    .send({
      roomId,
      appliances: [
        { name: 'TV', type: 'entertainment', wattage: 150, dailyUsageHours: 4 },
        { name: 'Fridge', type: 'kitchen', wattage: 200, dailyUsageHours: 24 },
      ],
    });

  return homeId;
}

describe('GET /api/energy/:homeId/dashboard', () => {
  it('returns the dashboard envelope with totals and breakdowns', async () => {
    const homeId = await seedHome();

    const res = await request(app).get(`/api/energy/${homeId}/dashboard`);

    expect(res.status).toBe(HTTP_OK);
    expect(res.body.success).toBe(true);
    const data = res.body.data;

    expect(data.totalMonthlyKwh).toBeGreaterThan(0);
    expect(data.totalMonthlyCost).toBeGreaterThan(0);
    expect(data.evnTier).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.topConsumers)).toBe(true);
    expect(Array.isArray(data.roomStats)).toBe(true);
    expect(data.co2).toBeDefined();
  });

  it('returns 404 when the home does not exist', async () => {
    const res = await request(app).get('/api/energy/unknown/dashboard');
    expect(res.status).toBe(HTTP_NOT_FOUND);
    expect(res.body.success).toBe(false);
  });
});
