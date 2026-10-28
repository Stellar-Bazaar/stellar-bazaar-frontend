import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndexerApiClient } from '../services/indexer-client';

describe('IndexerApiClient service', () => {
  let client: IndexerApiClient;

  beforeEach(() => {
    client = new IndexerApiClient('http://localhost:8088');
    vi.restoreAllMocks();
  });

  it('correctly constructs with sanitized base URL', () => {
    const trailingSlashClient = new IndexerApiClient('http://localhost:8088/');
    expect(trailingSlashClient).toBeDefined();
  });

  it('fetches daemon health metrics', async () => {
    const mockHealth = {
      status: 'healthy',
      uptime_seconds: 120,
      latest_ledger: 105,
      total_events_indexed: 15,
      total_circles_indexed: 3,
      total_disputes_indexed: 0,
      consecutive_errors: 0,
      last_error: null,
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockHealth,
    } as Response);

    const health = await client.getHealth();
    expect(health.status).toBe('healthy');
    expect(health.latest_ledger).toBe(105);
  });

  it('fetches active circles list', async () => {
    const mockCircles = [
      {
        id: 'CIRCLE_1',
        title: 'Bulk Coffee',
        category: 'Commodities',
        target_unit_price_xlm: '10.0',
        min_volume: 100,
        max_volume: 5000,
        current_volume: 2500,
        status: 'OPEN',
        creator_address: 'GCREATOR',
        deadline_timestamp: 1720000000,
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockCircles,
    } as Response);

    const circles = await client.listActiveCircles();
    expect(circles).toHaveLength(1);
    expect(circles[0].id).toBe('CIRCLE_1');
  });

  it('returns null when circle is not found (404)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const circle = await client.getCircle('NON_EXISTENT');
    expect(circle).toBeNull();
  });

  it('fetches latest checkpoint sequence number', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ last_ledger: 142050 }),
    } as Response);

    const checkpoint = await client.getCheckpoint();
    expect(checkpoint).toBe(142050);
  });
});
