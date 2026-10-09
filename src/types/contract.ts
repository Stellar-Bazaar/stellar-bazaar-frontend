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
