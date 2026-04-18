export type AppView =
  | 'overview'
  | 'moneyFlow'
  | 'wealth'
  | 'liabilities'
  | 'obligations'
  | 'reports'
  | 'settings';

export type OverviewData = {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  upcomingObligations: number;
};

export type MoneyFlowDirection = 'inflow' | 'outflow';

export type MoneyFlowRecord = {
  id: string;
  direction: MoneyFlowDirection;
  flowType: string;
  category: string;
  account: string;
  amount: number;
  date: string;
  note?: string;
};

export type WealthTimelinePoint = {
  date: string;
  netWorth: number;
};

export type AssetAllocationItem = {
  name: string;
  value: number;
  color?: string;
};

export type AssetPosition = {
  id: string;
  assetType: string;
  accountName: string;
  value: number;
  asOfDate: string;
  note?: string;
};

export type WealthData = {
  timeline: WealthTimelinePoint[];
  assets: AssetAllocationItem[];
  positions: AssetPosition[];
};

export type LiabilityPosition = {
  id: string;
  liabilityType: string;
  accountName: string;
  value: number;
  dueDate: string;
  minimumPayment: number;
  note?: string;
};

export type ObligationStatus = 'pending' | 'paid' | 'overdue';

export type Obligation = {
  id: string;
  title: string;
  category: string;
  account: string;
  amount: number;
  dueDate: string;
  status: ObligationStatus;
  note?: string;
};

export type MonthlyTrendPoint = {
  month: string;
  inflow: number;
  outflow: number;
};

export type CategoryDistributionItem = {
  name: string;
  value: number;
};

export type ReportData = {
  monthlyTrend: MonthlyTrendPoint[];
  categoryDistribution: CategoryDistributionItem[];
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};