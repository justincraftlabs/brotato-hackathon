import request from 'supertest';
import { createTestApp } from '../test-app';

const app = createTestApp();

const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const HTTP_BAD_REQUEST = 400;

async function seedHomeWithAc(): Promise<{ homeId: string; applianceId: string }> {
  const setup = await request(app)
    .post('/api/home/setup')
    .send({
      rooms: [{ name: 'Living Room', type: 'living_room', size: 'medium' }],
    });
  const homeId = setup.body.data.homeId as string;
  const roomId = setup.body.data.rooms[0].roomId as string;

  const add = await request(app)
    .post(`/api/home/${homeId}/appliances`)
    .send({
      roomId,
      appliances: [
        {
          name: 'Air Conditioner',
          type: 'cooling',
          wattage: 1000,
          dailyUsageHours: 8,
        },
      ],
    });

  return {
    homeId,
    applianceId: add.body.data.appliances[0].applianceId,
  };
}

describe('POST /api/simulator/calculate', () => {
  it('returns baseline results with zero savings when no adjustments', async () => {
    const { homeId } = await seedHomeWithAc();

    const res = await request(app)
      .post('/api/simulator/calculate')
      .send({ homeId, adjustments: [] });

    expect(res.status).toBe(HTTP_OK);
    expect(res.body.data.delta.kwhSaved).toBeCloseTo(0);
    expect(res.body.data.delta.costSaved).toBe(0);
  });

  it('reports positive savings when hours are reduced', async () => {
    const { homeId, applianceId } = await seedHomeWithAc();

    const res = await request(app)
      .post('/api/simulator/calculate')
      .send({
        homeId,
        adjustments: [{ applianceId, newDailyHours: 3 }],
      });

    expect(res.status).toBe(HTTP_OK);
    expect(res.body.data.delta.kwhSaved).toBeGreaterThan(0);
    expect(res.body.data.delta.treesEquivalent).toBeGreaterThan(0);
  });

  it('returns 404 when the home does not exist', async () => {
    const res = await request(app)
      .post('/api/simulator/calculate')
      .send({ homeId: 'not-a-home', adjustments: [] });

    expect(res.status).toBe(HTTP_NOT_FOUND);
  });

  it('rejects temperature adjustments outside [16, 60]', async () => {
    const { homeId, applianceId } = await seedHomeWithAc();

    const res = await request(app)
      .post('/api/simulator/calculate')
      .send({
        homeId,
        adjustments: [{ applianceId, newTemperature: 5 }],
      });

    expect(res.status).toBe(HTTP_BAD_REQUEST);
  });
});
