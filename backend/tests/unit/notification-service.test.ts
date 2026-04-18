import { Response } from 'express';
import {
  registerSseClient,
  removeSseClient,
  notifyClients,
  FiredScheduleEvent,
} from '../../src/services/notification-service';

function createMockSseResponse(): Response {
  return {
    write: jest.fn(),
  } as unknown as Response;
}

const HOME_ID = 'home-1';
const FRONTEND_BASE_URL = 'http://localhost:3000';
const EVENT: FiredScheduleEvent = {
  scheduleId: 'sched-1',
  title: 'Tắt máy lạnh',
  applianceName: 'AC',
  roomName: 'Phòng ngủ',
  savingsVnd: 100000,
  savingsKwh: 12,
};

describe('notification-service', () => {
  const fetchMock = jest.fn();
  const originalSlackUrl = process.env.SLACK_WEBHOOK_URL;

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ ok: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;
  });

  afterAll(() => {
    if (originalSlackUrl === undefined) {
      delete process.env.SLACK_WEBHOOK_URL;
    } else {
      process.env.SLACK_WEBHOOK_URL = originalSlackUrl;
    }
  });

  it('pushes the SSE event to every registered client for the home', async () => {
    const res1 = createMockSseResponse();
    const res2 = createMockSseResponse();
    registerSseClient(HOME_ID, res1);
    registerSseClient(HOME_ID, res2);

    await notifyClients(HOME_ID, EVENT, FRONTEND_BASE_URL);

    expect(res1.write).toHaveBeenCalledTimes(1);
    expect(res2.write).toHaveBeenCalledTimes(1);
    expect((res1.write as jest.Mock).mock.calls[0][0]).toContain('schedule-fired');

    removeSseClient(HOME_ID, res1);
    removeSseClient(HOME_ID, res2);
  });

  it('does not post to Slack when SLACK_WEBHOOK_URL is unset', async () => {
    delete process.env.SLACK_WEBHOOK_URL;

    await notifyClients(HOME_ID, EVENT, FRONTEND_BASE_URL);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts a Slack webhook when SLACK_WEBHOOK_URL is configured', async () => {
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/fake';

    await notifyClients(HOME_ID, EVENT, FRONTEND_BASE_URL);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://hooks.slack.com/fake');
    expect((init as RequestInit).method).toBe('POST');
  });

  it('removeSseClient prunes the client from the registry', async () => {
    const res = createMockSseResponse();
    registerSseClient(HOME_ID, res);
    removeSseClient(HOME_ID, res);

    await notifyClients(HOME_ID, EVENT, FRONTEND_BASE_URL);

    expect(res.write).not.toHaveBeenCalled();
  });
});
