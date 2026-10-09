export type CircleStatusEnum = 'OPEN' | 'CLOSED' | 'EXPIRED' | 'CANCELLED';

export interface OnChainDemandCircle {
  id: number;
  creator: string;
  title: string;
  metadata_uri: string;
  target_quantity: number;
  target_price_stroops: string;
  target_price_xlm: string;
  deadline: number;
  deadlineDate: string;
  created_at: number;
  createdDate: string;
  status: CircleStatusEnum;
  isExpired: boolean;
  isAuthoritativeOnChain: boolean;
}

export interface OnChainDeal {
  id: number;
  creator: string;
  token: string;
  target_unit_price_stroops: string;
  target_unit_price_xlm: string;
  min_volume: number;
  max_volume: number;
  current_volume: number;
  total_escrow_stroops: string;
  total_escrow_xlm: string;
  deadline: number;
  deadlineDate: string;
  status: 'OPEN' | 'QUORUM_REACHED' | 'SETTLED' | 'CANCELLED';
  registry_address?: string;
  registry_circle_id?: number;
  accepted_offer_id?: number;
}

export interface OnChainOffer {
  id: number;
  seller: string;
  circle_id: number;
  unit_price_stroops: string;
  unit_price_xlm: string;
  volume: number;
  lead_time_days: number;
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
}

export interface SellerReputation {
  seller: string;
  successful_deals: number;
  total_volume_settled: number;
  total_amount_settled_stroops: string;
  total_amount_settled_xlm: string;
  disputed_or_refunded_deals: number;
  scorePercentage: number;
}

export interface ContractDeploymentConfig {
  contractName: string;
  network: string;
  networkPassphrase: string;
  rpcUrl: string;
  contractId: string;
  wasmHash: string;
  deployerAddress: string;
  uploadTxHash: string;
  deploymentTxHash: string;
  initializeTxHash: string;
  sampleCircleTxHash: string;
  sampleCircleId: number;
  explorerUrl: string;
  deployedAt: string;
  dealEngine?: {
    contractName: string;
    contractId: string;
    wasmHash: string;
    uploadTxHash: string;
    deploymentTxHash: string;
    initializeTxHash: string;
    crossContractTxHash: string;
    dealId: number;
    nativeXlmSac: string;
    explorerUrl: string;
    deployedAt: string;
    liveOfferTxHash?: string;
    liveOfferId?: number;
    liveCommitTxHash?: string;
    acceptOfferTxHash?: string;
    settleDealTxHash?: string;
  };
}

export interface CreateCircleParams {
  title: string;
  metadata_uri: string;
  target_quantity: number;
  target_price_xlm: string;
  duration_days: number;
}

export interface ContractEventItem {
  id: string;
  type: string;
  circleId: number;
  txHash: string;
  ledger: number;
  timestamp: string;
  contractId: string;
  data: Record<string, any>;
}
