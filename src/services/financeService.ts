import type {
  OverviewData,
  MoneyFlowRecord,
  WealthData,
  LiabilityPosition,
  Obligation,
  ReportData,
} from '../types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};

type MoneyFlowPayload = {
  direction: 'inflow' | 'outflow';
  flowType: string;
  category: string;
  account: string;
  amount: number;
  date: string;
  note?: string;
};

type AssetPayload = {
  assetType: string;
  accountName: string;
  value: number;
  asOfDate: string;
  note?: string;
};

type ObligationPayload = {
  title: string;
  category: string;
  account: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  note?: string;
};

const GAS_WEB_APP_URL = (import.meta as any).env.VITE_GAS_WEB_APP_URL?.trim();

function ensureBaseUrl() {
  if (!GAS_WEB_APP_URL) {
    throw new Error('Missing VITE_GAS_WEB_APP_URL in your environment configuration.');
  }
  return GAS_WEB_APP_URL;
}

function buildUrl(action: string, params?: Record<string, string | number | boolean | undefined | null>) {
  const url = new URL(ensureBaseUrl());

  url.searchParams.set('action', action);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error('Server returned an invalid JSON response.');
  }
}

async function getRequest<T>(
  action: string,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<T> {
  const response = await fetch(buildUrl(action, params), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const result = await parseJsonResponse<T>(response);

  if (!result.success) {
    throw new Error(result.error || `GET ${action} failed.`);
  }

  return result.data;
}

async function postRequest<T>(
  action: string,
  payload?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(ensureBaseUrl(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      ...(payload || {}),
    }),
  });

  const result = await parseJsonResponse<T>(response);

  if (!result.success) {
    throw new Error(result.error || `POST ${action} failed.`);
  }

  return result.data;
}

function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeOverview(raw: any): OverviewData {
  return {
    netWorth: toNumber(raw?.netWorth),
    totalAssets: toNumber(raw?.totalAssets),
    totalLiabilities: toNumber(raw?.totalLiabilities),
    totalInflow: toNumber(raw?.totalInflow),
    totalOutflow: toNumber(raw?.totalOutflow),
    netFlow: toNumber(raw?.netFlow),
    upcomingObligations: toNumber(raw?.upcomingObligations),
  };
}

function normalizeMoneyFlowRecord(raw: any): MoneyFlowRecord {
  return {
    id: String(raw?.id || ''),
    direction: raw?.direction === 'inflow' ? 'inflow' : 'outflow',
    flowType: String(raw?.flowType || ''),
    category: String(raw?.category || ''),
    account: String(raw?.account || ''),
    amount: toNumber(raw?.amount),
    date: String(raw?.date || ''),
    note: String(raw?.note || ''),
  } as MoneyFlowRecord;
}

function normalizeWealthData(raw: any): WealthData {
  return {
    timeline: Array.isArray(raw?.timeline)
      ? raw.timeline.map((item: any) => ({
          date: String(item?.date || item?.month || ''),
          netWorth: toNumber(item?.netWorth),
        }))
      : [],
    assets: Array.isArray(raw?.assets)
      ? raw.assets.map((item: any, index: number) => ({
          name: String(item?.name || item?.assetType || `Asset ${index + 1}`),
          value: toNumber(item?.value),
          color: String(
            item?.color ||
              ['#19C2B3', '#334155', '#475569', '#64748B', '#94A3B8'][index % 5]
          ),
        }))
      : [],
    positions: Array.isArray(raw?.positions)
      ? raw.positions.map((item: any) => ({
          id: String(item?.id || ''),
          assetType: String(item?.assetType || ''),
          accountName: String(item?.accountName || ''),
          value: toNumber(item?.value),
          asOfDate: String(item?.asOfDate || item?.date || ''),
          note: String(item?.note || ''),
        }))
      : [],
  } as WealthData;
}

function normalizeLiability(raw: any): LiabilityPosition {
  return {
    id: String(raw?.id || ''),
    liabilityType: String(raw?.liabilityType || ''),
    accountName: String(raw?.accountName || ''),
    value: toNumber(raw?.value),
    dueDate: String(raw?.dueDate || ''),
    minimumPayment: toNumber(raw?.minimumPayment),
    note: String(raw?.note || ''),
  } as LiabilityPosition;
}

function normalizeObligation(raw: any): Obligation {
  return {
    id: String(raw?.id || ''),
    title: String(raw?.title || ''),
    category: String(raw?.category || ''),
    account: String(raw?.account || ''),
    amount: toNumber(raw?.amount),
    dueDate: String(raw?.dueDate || ''),
    status:
      raw?.status === 'paid' || raw?.status === 'overdue' ? raw.status : 'pending',
    note: String(raw?.note || ''),
  } as Obligation;
}

function normalizeReportData(raw: any): ReportData {
  return {
    monthlyTrend: Array.isArray(raw?.monthlyTrend)
      ? raw.monthlyTrend.map((item: any) => ({
          month: String(item?.month || ''),
          inflow: toNumber(item?.inflow),
          outflow: toNumber(item?.outflow),
        }))
      : [],
    categoryDistribution: Array.isArray(raw?.categoryDistribution)
      ? raw.categoryDistribution.map((item: any) => ({
          name: String(item?.name || item?.category || 'Unknown'),
          value: toNumber(item?.value),
        }))
      : [],
  } as ReportData;
}

export async function getOverviewData(): Promise<OverviewData> {
  const data = await getRequest<any>('getOverviewData');
  return normalizeOverview(data);
}

export async function getMoneyFlow(): Promise<MoneyFlowRecord[]> {
  const data = await getRequest<any[]>('getMoneyFlow');
  return Array.isArray(data) ? data.map(normalizeMoneyFlowRecord) : [];
}

export async function getWealthData(): Promise<WealthData> {
  const data = await getRequest<any>('getWealthData');
  return normalizeWealthData(data);
}

export async function getLiabilities(): Promise<LiabilityPosition[]> {
  const data = await getRequest<any[]>('getLiabilities');
  return Array.isArray(data) ? data.map(normalizeLiability) : [];
}

export async function getObligations(): Promise<Obligation[]> {
  const data = await getRequest<any[]>('getObligations');
  return Array.isArray(data) ? data.map(normalizeObligation) : [];
}

export async function getReports(): Promise<ReportData> {
  const data = await getRequest<any>('getReports');
  return normalizeReportData(data);
}

export async function addMoneyFlow(payload: MoneyFlowPayload): Promise<MoneyFlowRecord> {
  const data = await postRequest<any>('addMoneyFlow', payload);
  return normalizeMoneyFlowRecord(data);
}

export async function addAsset(payload: AssetPayload): Promise<any> {
  return postRequest<any>('addAsset', payload);
}

export async function addObligation(payload: ObligationPayload): Promise<Obligation> {
  const data = await postRequest<any>('addObligation', payload);
  return normalizeObligation(data);
}

export async function healthCheck(): Promise<any> {
  return getRequest<any>('health');
}