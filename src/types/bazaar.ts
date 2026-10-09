export interface DemandCircleDemo {
  id: string;
  title: string;
  category: string;
  description: string;
  targetUnitPriceXlm: number;
  marketPriceXlm: number;
  minVolume: number;
  currentVolume: number;
  maxVolume: number;
  participantsCount: number;
  deadlineHours: number;
  status: 'OPEN' | 'QUORUM_REACHED' | 'SETTLED';
  sellerQuotesCount: number;
  bestSellerQuoteXlm?: number;
}
