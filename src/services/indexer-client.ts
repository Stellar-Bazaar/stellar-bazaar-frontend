/**
 * Typed client for interacting with the embedded Stellar Bazaar Indexer REST API
 */

export interface IndexerHealthResponse {
  status: 'healthy' | 'degraded' | 'syncing';
  uptime_seconds: number;
  latest_ledger: number;
  total_events_indexed: number;
  total_circles_indexed: number;
  total_disputes_indexed: number;
  consecutive_errors: number;
  last_error: string | null;
}

export interface DemandCircleDTO {
  id: string;
  title: string;
  category: string;
  target_unit_price_xlm: string;
  min_volume: number;
  max_volume: number;
  current_volume: number;
  status: string;
  creator_address: string;
  deadline_timestamp: number;
}

export interface CommitmentDTO {
  id: string;
  circle_id: string;
  buyer_address: string;
  quantity: number;
  committed_amount_xlm: string;
  escrow_tx_hash?: string;
  status: string;
}

export interface SellerOfferDTO {
  id: string;
  circle_id: string;
  seller_address: string;
  offered_unit_price_xlm: string;
  available_volume: number;
  lead_time_days: number;
  status: string;
}

export interface SellerReputationDTO {
  seller_address: string;
  successful_deals: number;
  total_volume_settled: number;
  total_amount_settled_xlm: string;
  disputed_or_refunded_deals: number;
  score_percentage: number;
}

export interface DisputeDTO {
  id: string;
  circle_id: string;
  initiator_address: string;
  dispute_reason: string;
  status: string;
  resolution_refund_to_buyers: boolean | null;
  opened_at_timestamp: number;
  resolved_at_timestamp: number | null;
}

export class IndexerApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8088') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(path: string): Promise<T> {
    const resp = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!resp.ok) {
      if (resp.status === 404) {
        throw new Error(`NotFound: ${path}`);
      }
      throw new Error(`Indexer API request failed (${resp.status}): ${resp.statusText}`);
    }

    return resp.json();
  }

  async getHealth(): Promise<IndexerHealthResponse> {
    return this.request<IndexerHealthResponse>('/health');
  }

  async listActiveCircles(): Promise<DemandCircleDTO[]> {
    return this.request<DemandCircleDTO[]>('/api/v1/circles');
  }

  async getCircle(id: string): Promise<DemandCircleDTO | null> {
    try {
      return await this.request<DemandCircleDTO>(`/api/v1/circles/${encodeURIComponent(id)}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith('NotFound')) {
        return null;
      }
      throw err;
    }
  }

  async getCommitments(circleId: string): Promise<CommitmentDTO[]> {
    return this.request<CommitmentDTO[]>(`/api/v1/circles/${encodeURIComponent(circleId)}/commitments`);
  }

  async getOffers(circleId: string): Promise<SellerOfferDTO[]> {
    return this.request<SellerOfferDTO[]>(`/api/v1/circles/${encodeURIComponent(circleId)}/offers`);
  }

  async getDisputes(circleId: string): Promise<DisputeDTO[]> {
    return this.request<DisputeDTO[]>(`/api/v1/circles/${encodeURIComponent(circleId)}/disputes`);
  }

  async getTopSellers(): Promise<SellerReputationDTO[]> {
    return this.request<SellerReputationDTO[]>('/api/v1/sellers/top');
  }

  async getSellerReputation(sellerAddress: string): Promise<SellerReputationDTO | null> {
    try {
      return await this.request<SellerReputationDTO>(
        `/api/v1/sellers/${encodeURIComponent(sellerAddress)}/reputation`
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith('NotFound')) {
        return null;
      }
      throw err;
    }
  }

  async getCheckpoint(): Promise<number> {
    const res = await this.request<{ last_ledger: number }>('/api/v1/checkpoint');
    return res.last_ledger;
  }
}

export const indexerApi = new IndexerApiClient();
