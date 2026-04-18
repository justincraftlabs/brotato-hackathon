import { Response } from 'express';

// In-memory SSE client registry: homeId → set of open Response streams
const sseClients = new Map<string, Set<Response>>();

export function registerSseClient(homeId: string, res: Response): void {
  if (!sseClients.has(homeId)) {
    sseClients.set(homeId, new Set());
  }
  sseClients.get(homeId)!.add(res);
}

export function removeSseClient(homeId: string, res: Response): void {
  const clients = sseClients.get(homeId);
  if (!clients) return;
  clients.delete(res);
  if (clients.size === 0) {
    sseClients.delete(homeId);
  }
}

export interface FiredScheduleEvent {
  scheduleId: string;
  title: string;
  applianceName: string;
  roomName: string;
  savingsVnd: number;
  savingsKwh: number;
}

function pushSseEvent(homeId: string, event: FiredScheduleEvent): void {
  const clients = sseClients.get(homeId);
  if (!clients || clients.size === 0) return;
  const data = `event: schedule-fired\ndata: ${JSON.stringify(event)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}

async function postToSlack(event: FiredScheduleEvent, completeUrl: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const co2Kg = (event.savingsKwh * 0.913).toFixed(1);
  const vndFormatted = event.savingsVnd.toLocaleString('vi-VN');

  const body = {
    text: `⚡ Nhắc nhở tiết kiệm điện từ Khoai Tây!`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🥔 Khoai Tây nhắc bạn:*\n_${event.roomName} — ${event.applianceName}_\n*${event.title}*`,
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Tiết kiệm:* ${vndFormatted} VND/tháng` },
          { type: 'mrkdwn', text: `*CO₂:* ${co2Kg} kg` },
        ],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Đã làm rồi!' },
            url: completeUrl,
            style: 'primary',
          },
        ],
      },
    ],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function notifyClients(
  homeId: string,
  event: FiredScheduleEvent,
  frontendBaseUrl: string
): Promise<void> {
  const completeUrl = `${frontendBaseUrl}/schedules?complete=${event.scheduleId}`;
  await postToSlack(event, completeUrl);
  pushSseEvent(homeId, event);
}
