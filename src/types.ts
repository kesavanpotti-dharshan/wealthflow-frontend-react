export type AppView =
  | 'overview'
  | 'moneyFlow'
  | 'wealth'
  | 'liabilities'
  | 'obligations'
  | 'reports'
  | 'settings';

export type FlowDirection = 'inflow' | 'outflow';

export type FlowType =
  | 'salary'
  | 'bonus'
  | 'freelance'
  | 'interest'
  | 'dividend'
  | 'rental-income'
  | 'expense'
  | 'bill'
  | 'subscription'
  | 'debt-payment'
  | 'investment-contribution'
  | 'savings-contribution'
  | 'transfer'
  | 'tax'
  | 'other';

export type ObligationStatus = 'pending' | 'paid' | 'overdue';

export type AssetType =
  | 'cash'
  | 'bank'
  | 'savings'
  | 'stocks'
  | 'mutual-funds'
  | 'retirement'
  | 'crypto'
  | 'gold'
  | 'real-estate'
  | 'business'
  | 'other';

export type LiabilityType =
  | 'credit-card'
  | 'personal-loan'
  | 'student-loan'
  | 'car-loan'
  | 'mortgage'
  | 'tax-debt'
  | 'borrowed-money'
  | 'other';

export interface MoneyFlowRecord {
  id: string;
  direction: FlowDirection;
  flowType: FlowType;
  category: string;
  account: string;
  amount: number;
  date: string;
  month: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetPosition {
  id: string;
  assetType: AssetType | string;
  accountName: string;
  value: number;
  asOfDate: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiabilityPosition {
  id: string;
  liabilityType: LiabilityType | string;
  accountName: string;
  value: number;
  dueDate: string;
  minimumPayment: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Obligation {
  id: string;
  title: string;
  category: string;
  account: string;
  amount: number;
  dueDate: string;
  status: ObligationStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface OverviewData {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  upcomingObligations: number;
  assetCount: number;
  liabilityCount: number;
  obligationCount: number;
}

export interface AssetAllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface NetWorthPoint {
  date: string;
  netWorth: number;
}

export interface WealthData {
  assets: AssetAllocationItem[];
  positions: AssetPosition[];
  timeline: NetWorthPoint[];
}

export interface LiabilitySummary {
  totalLiabilities: number;
  totalMinimumPayments: number;
  dueSoonCount: number;
}

export interface MonthlyFlowTrend {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

export interface CategoryDistributionItem {
  name: string;
  value: number;
}

export interface ReportData {
  monthlyTrend: MonthlyFlowTrend[];
  categoryDistribution: CategoryDistributionItem[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface AddMoneyFlowInput {
  direction: FlowDirection;
  flowType: FlowType;
  category: string;
  account: string;
  amount: number;
  date: string;
  note?: string;
}

export interface UpdateMoneyFlowInput extends Partial<AddMoneyFlowInput> {
  id: string;
}

export interface AddAssetInput {
  assetType: AssetType | string;
  accountName: string;
  value: number;
  asOfDate?: string;
  note?: string;
}

export interface UpdateAssetInput extends Partial<AddAssetInput> {
  id: string;
}

export interface AddLiabilityInput {
  liabilityType: LiabilityType | string;
  accountName: string;
  value: number;
  dueDate?: string;
  minimumPayment?: number;
  note?: string;
}

export interface UpdateLiabilityInput extends Partial<AddLiabilityInput> {
  id: string;
}

export interface AddObligationInput {
  title: string;
  category: string;
  account: string;
  amount: number;
  dueDate: string;
  status?: ObligationStatus;
  note?: string;
}

export interface UpdateObligationInput extends Partial<AddObligationInput> {
  id: string;
}