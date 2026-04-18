import { apiRequest } from './api';
import type {
  OverviewData,
  MoneyFlowRecord,
  WealthData,
  LiabilityPosition,
  Obligation,
  ReportData,
  AddMoneyFlowInput,
  UpdateMoneyFlowInput,
  AddAssetInput,
  UpdateAssetInput,
  AddLiabilityInput,
  UpdateLiabilityInput,
  AddObligationInput,
  UpdateObligationInput,
  AssetPosition,
} from '../types';

export async function getOverviewData(): Promise<OverviewData> {
  return apiRequest<OverviewData>({
    method: 'GET',
    action: 'getOverviewData',
  });
}

export async function getMoneyFlow(): Promise<MoneyFlowRecord[]> {
  return apiRequest<MoneyFlowRecord[]>({
    method: 'GET',
    action: 'getMoneyFlow',
  });
}

export async function getWealthData(): Promise<WealthData> {
  return apiRequest<WealthData>({
    method: 'GET',
    action: 'getWealthData',
  });
}

export async function getLiabilities(): Promise<LiabilityPosition[]> {
  return apiRequest<LiabilityPosition[]>({
    method: 'GET',
    action: 'getLiabilities',
  });
}

export async function getObligations(): Promise<Obligation[]> {
  return apiRequest<Obligation[]>({
    method: 'GET',
    action: 'getObligations',
  });
}

export async function getReports(): Promise<ReportData> {
  return apiRequest<ReportData>({
    method: 'GET',
    action: 'getReports',
  });
}

export async function addMoneyFlow(input: AddMoneyFlowInput): Promise<MoneyFlowRecord> {
  return apiRequest<MoneyFlowRecord>({
    method: 'POST',
    action: 'addMoneyFlow',
    payload: {
      direction: input.direction,
      flowType: input.flowType,
      category: input.category,
      account: input.account,
      amount: input.amount,
      date: input.date,
      note: input.note || '',
    },
  });
}

export async function updateMoneyFlow(input: UpdateMoneyFlowInput): Promise<MoneyFlowRecord> {
  return apiRequest<MoneyFlowRecord>({
    method: 'POST',
    action: 'updateMoneyFlow',
    payload: {
      id: input.id,
      direction: input.direction,
      flowType: input.flowType,
      category: input.category,
      account: input.account,
      amount: input.amount,
      date: input.date,
      note: input.note,
    },
  });
}

export async function deleteMoneyFlow(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({
    method: 'POST',
    action: 'deleteMoneyFlow',
    payload: { id },
  });
}

export async function addAsset(input: AddAssetInput): Promise<AssetPosition> {
  return apiRequest<AssetPosition>({
    method: 'POST',
    action: 'addAsset',
    payload: {
      assetType: input.assetType,
      accountName: input.accountName,
      value: input.value,
      asOfDate: input.asOfDate || '',
      note: input.note || '',
    },
  });
}

export async function updateAsset(input: UpdateAssetInput): Promise<AssetPosition> {
  return apiRequest<AssetPosition>({
    method: 'POST',
    action: 'updateAsset',
    payload: {
      id: input.id,
      assetType: input.assetType,
      accountName: input.accountName,
      value: input.value,
      asOfDate: input.asOfDate,
      note: input.note,
    },
  });
}

export async function deleteAsset(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({
    method: 'POST',
    action: 'deleteAsset',
    payload: { id },
  });
}

export async function addLiability(input: AddLiabilityInput): Promise<LiabilityPosition> {
  return apiRequest<LiabilityPosition>({
    method: 'POST',
    action: 'addLiability',
    payload: {
      liabilityType: input.liabilityType,
      accountName: input.accountName,
      value: input.value,
      dueDate: input.dueDate || '',
      minimumPayment: input.minimumPayment || 0,
      note: input.note || '',
    },
  });
}

export async function updateLiability(input: UpdateLiabilityInput): Promise<LiabilityPosition> {
  return apiRequest<LiabilityPosition>({
    method: 'POST',
    action: 'updateLiability',
    payload: {
      id: input.id,
      liabilityType: input.liabilityType,
      accountName: input.accountName,
      value: input.value,
      dueDate: input.dueDate,
      minimumPayment: input.minimumPayment,
      note: input.note,
    },
  });
}

export async function deleteLiability(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({
    method: 'POST',
    action: 'deleteLiability',
    payload: { id },
  });
}

export async function addObligation(input: AddObligationInput): Promise<Obligation> {
  return apiRequest<Obligation>({
    method: 'POST',
    action: 'addObligation',
    payload: {
      title: input.title,
      category: input.category,
      account: input.account,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status || 'pending',
      note: input.note || '',
    },
  });
}

export async function updateObligation(input: UpdateObligationInput): Promise<Obligation> {
  return apiRequest<Obligation>({
    method: 'POST',
    action: 'updateObligation',
    payload: {
      id: input.id,
      title: input.title,
      category: input.category,
      account: input.account,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      note: input.note,
    },
  });
}

export async function deleteObligation(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({
    method: 'POST',
    action: 'deleteObligation',
    payload: { id },
  });
}

export async function markObligationPaid(id: string): Promise<Obligation> {
  return apiRequest<Obligation>({
    method: 'POST',
    action: 'markObligationPaid',
    payload: { id },
  });
}