import request from 'supertest';
import { createTestApp } from '../test-app';

const app = createTestApp();

const HTTP_OK = 200;
const HTTP_CREATED = 201;
const HTTP_NOT_FOUND = 404;
const HTTP_BAD_REQUEST = 400;

describe('POST /api/home/setup', () => {
  it('creates a home with rooms and returns 201', async () => {
    const res = await request(app)
      .post('/api/home/setup')
      .send({
        rooms: [
          { name: 'Living Room', type: 'living_room', size: 'medium' },
          { name: 'Bedroom', type: 'bedroom', size: 'small' },
        ],
      });

    expect(res.status).toBe(HTTP_CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data.homeId).toBeDefined();
    expect(res.body.data.rooms).toHaveLength(2);
  });

  it('rejects an empty rooms array with 400', async () => {
    const res = await request(app)
      .post('/api/home/setup')
      .send({ rooms: [] });

    expect(res.status).toBe(HTTP_BAD_REQUEST);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid room types with 400', async () => {
    const res = await request(app)
      .post('/api/home/setup')
      .send({
        rooms: [{ name: 'Cave', type: 'dungeon', size: 'medium' }],
      });

    expect(res.status).toBe(HTTP_BAD_REQUEST);
  });
});

describe('POST /api/home/:homeId/appliances', () => {
  async function createHomeViaApi(): Promise<{ homeId: string; roomId: string }> {
    const res = await request(app)
      .post('/api/home/setup')
      .send({
        rooms: [{ name: 'Living Room', type: 'living_room', size: 'medium' }],
      });
    return {
      homeId: res.body.data.homeId,
      roomId: res.body.data.rooms[0].roomId,
    };
  }

  it('adds appliances to a room and returns 201', async () => {
    const { homeId, roomId } = await createHomeViaApi();

    const res = await request(app)
      .post(`/api/home/${homeId}/appliances`)
      .send({
        roomId,
        appliances: [
          {
            name: 'TV',
            type: 'entertainment',
            wattage: 150,
            dailyUsageHours: 4,
          },
        ],
      });

    expect(res.status).toBe(HTTP_CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appliances).toHaveLength(1);
    expect(res.body.data.appliances[0].monthlyKwh).toBeGreaterThan(0);
  });

  it('returns 404 when the home does not exist', async () => {
    const res = await request(app)
      .post('/api/home/missing-home/appliances')
      .send({
        roomId: 'any',
        appliances: [
          {
            name: 'TV',
            type: 'entertainment',
            wattage: 150,
            dailyUsageHours: 4,
          },
        ],
      });

    expect(res.status).toBe(HTTP_NOT_FOUND);
  });

  it('returns 400 for non-positive wattage', async () => {
    const { homeId, roomId } = await createHomeViaApi();

    const res = await request(app)
      .post(`/api/home/${homeId}/appliances`)
      .send({
        roomId,
        appliances: [
          {
            name: 'TV',
            type: 'entertainment',
            wattage: 0,
            dailyUsageHours: 4,
          },
        ],
      });

    expect(res.status).toBe(HTTP_BAD_REQUEST);
  });
});

describe('GET /api/home/:homeId', () => {
  it('returns the full home with appliances', async () => {
    const setup = await request(app)
      .post('/api/home/setup')
      .send({
        rooms: [{ name: 'Room', type: 'bedroom', size: 'small' }],
      });
    const homeId = setup.body.data.homeId as string;
    const roomId = setup.body.data.rooms[0].roomId as string;

    await request(app)
      .post(`/api/home/${homeId}/appliances`)
      .send({
        roomId,
        appliances: [
          { name: 'Lamp', type: 'lighting', wattage: 20, dailyUsageHours: 5 },
        ],
      });

    const res = await request(app).get(`/api/home/${homeId}`);

    expect(res.status).toBe(HTTP_OK);
    expect(res.body.data.rooms[0].appliances).toHaveLength(1);
  });

  it('returns 404 for a missing home', async () => {
    const res = await request(app).get('/api/home/not-here');
    expect(res.status).toBe(HTTP_NOT_FOUND);
  });
});
