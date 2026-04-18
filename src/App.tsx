import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  CalendarClock,
  BarChart3,
  Settings,
  Plus,
  Search,
  TrendingUp,
  Landmark,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import type {
  AppView,
  OverviewData,
  MoneyFlowRecord,
  WealthData,
  LiabilityPosition,
  Obligation,
  ReportData,
} from './types';

import {
  getOverviewData,
  getMoneyFlow,
  getWealthData,
  getLiabilities,
  getObligations,
  getReports,
} from './services/financeService';

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(val || 0);

const formatDate = (value: string) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 group border-r-2 ${
      active
        ? 'bg-brand-accent/5 text-brand-accent border-brand-accent'
        : 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary border-transparent'
    }`}
  >
    <Icon size={18} className={active ? 'text-brand-accent' : 'group-hover:text-brand-text-primary'} />
    <span className="text-sm font-medium tracking-tight">{label}</span>
  </button>
);

const ViewHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) => (
  <div className="flex justify-between items-end mb-8 gap-4">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-brand-text-primary">{title}</h1>
      <p className="text-sm text-brand-text-secondary">{subtitle}</p>
    </div>
    {action}
  </div>
);

const StatCard = ({
  label,
  value,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accentClass: string;
}) => (
  <div className="premium-card p-5 group hover:border-brand-text-muted transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-lg ${accentClass} bg-opacity-10 text-opacity-100`}>
        <Icon size={18} className="text-current" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold tracking-tight text-brand-text-primary font-mono">
        {formatCurrency(value)}
      </p>
    </div>
  </div>
);

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wealthflow-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [activeView, setActiveView] = useState<AppView>('overview');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [moneyFlow, setMoneyFlow] = useState<MoneyFlowRecord[]>([]);
  const [wealthData, setWealthData] = useState<WealthData | null>(null);
  const [liabilities, setLiabilities] = useState<LiabilityPosition[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wealthflow-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const chartColors = useMemo(() => ({
    accent: theme === 'dark' ? '#19C2B3' : '#0F9F9A',
    success: theme === 'dark' ? '#22C55E' : '#16A34A',
    error: theme === 'dark' ? '#EF4444' : '#DC2626',
    warning: theme === 'dark' ? '#F59E0B' : '#D97706',
    muted: theme === 'dark' ? '#9FB0BD' : '#64748B',
    border: theme === 'dark' ? '#2B3B47' : '#D7E0E7',
    surface: theme === 'dark' ? '#16212B' : '#FFFFFF',
    text: theme === 'dark' ? '#ECFDFB' : '#0F172A',
  }), [theme]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, flow, wealth, liabilityRows, obligationRows, reports] = await Promise.all([
        getOverviewData(),
        getMoneyFlow(),
        getWealthData(),
        getLiabilities(),
        getObligations(),
        getReports(),
      ]);

      setOverviewData(overview);
      setMoneyFlow(flow);
      setWealthData(wealth);
      setLiabilities(liabilityRows);
      setObligations(obligationRows);
      setReportData(reports);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const recentMoneyFlow = useMemo(() => moneyFlow.slice(0, 6), [moneyFlow]);

  const pendingObligations = useMemo(
    () => obligations.filter((item) => item.status !== 'paid'),
    [obligations]
  );

  const dueSoonLiabilities = useMemo(
    () => liabilities
      .filter((item) => item.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5),
    [liabilities]
  );

  const totalMinimumPayments = useMemo(
    () => liabilities.reduce((sum, item) => sum + Number(item.minimumPayment || 0), 0),
    [liabilities]
  );

  const renderOverview = () => (
    <div className="space-y-8">
      <ViewHeader
        title="Overview"
        subtitle="Big-picture view of your money flow, wealth, liabilities, and upcoming commitments."
        action={
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} />
            <span>Quick Add</span>
          </button>
        }
      />

      {overviewData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            <div className="xl:col-span-2">
              <StatCard
                label="Net Worth"
                value={overviewData.netWorth}
                icon={TrendingUp}
                accentClass="bg-brand-accent/10 text-brand-accent"
              />
            </div>
            <StatCard
              label="Assets"
              value={overviewData.totalAssets}
              icon={Wallet}
              accentClass="bg-brand-success/10 text-brand-success"
            />
            <StatCard
              label="Liabilities"
              value={overviewData.totalLiabilities}
              icon={CreditCard}
              accentClass="bg-brand-error/10 text-brand-error"
            />
            <StatCard
              label="Monthly Inflow"
              value={overviewData.totalInflow}
              icon={ArrowUpRight}
              accentClass="bg-brand-success/10 text-brand-success"
            />
            <StatCard
              label="Monthly Outflow"
              value={overviewData.totalOutflow}
              icon={ArrowDownRight}
              accentClass="bg-brand-error/10 text-brand-error"
            />
            <StatCard
              label="Upcoming Obligations"
              value={overviewData.upcomingObligations}
              icon={CalendarClock}
              accentClass="bg-brand-warning/10 text-brand-warning"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="premium-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-semibold text-brand-text-primary">Net Worth Trend</h3>
                </div>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wealthData?.timeline || []}>
                      <defs>
                        <linearGradient id="colorNetWorthV2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.22} />
                          <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.border} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: chartColors.muted }}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.surface,
                          borderRadius: '12px',
                          border: `1px solid ${chartColors.border}`,
                          color: chartColors.text,
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                      />
                      <Area
                        type="monotone"
                        dataKey="netWorth"
                        stroke={chartColors.accent}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorNetWorthV2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="premium-card overflow-hidden">
                <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-black/10">
                  <h3 className="text-sm font-semibold text-brand-text-primary">Recent Money Flow</h3>
                  <button
                    onClick={() => setActiveView('moneyFlow')}
                    className="text-xs text-brand-text-secondary hover:text-brand-accent font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="data-grid-header">Date</th>
                        <th className="data-grid-header">Category</th>
                        <th className="data-grid-header">Direction</th>
                        <th className="data-grid-header">Account</th>
                        <th className="data-grid-header text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMoneyFlow.map((item) => (
                        <tr key={item.id} className="data-grid-row border-brand-border">
                          <td className="text-xs font-mono text-brand-text-muted">{item.date}</td>
                          <td className="font-medium text-brand-text-primary">{item.category || item.flowType}</td>
                          <td>
                            <span
                              className={`text-[10px] font-bold uppercase ${
                                item.direction === 'inflow' ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {item.direction}
                            </span>
                          </td>
                          <td className="text-brand-text-muted text-[11px] font-mono">{item.account || '—'}</td>
                          <td
                            className={`text-right font-mono font-bold ${
                              item.direction === 'inflow' ? 'text-brand-accent' : 'text-brand-text-primary'
                            }`}
                          >
                            {item.direction === 'inflow' ? '+' : '-'}
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="premium-card p-6">
                <h3 className="text-sm font-semibold text-brand-text-primary mb-6">Asset Allocation</h3>
                <div className="h-[220px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wealthData?.assets || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {(wealthData?.assets || []).map((entry, index) => (
                          <Cell
                            key={`asset-cell-${index}`}
                            fill={[chartColors.accent, '#334155', '#475569', '#64748b', '#94a3b8'][index % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.surface,
                          borderRadius: '12px',
                          border: `1px solid ${chartColors.border}`,
                          color: chartColors.text,
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Value']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  {(wealthData?.assets || []).map((asset) => (
                    <div key={asset.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: asset.color }} />
                        <span className="text-xs text-brand-text-secondary">{asset.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-brand-text-primary">{formatCurrency(asset.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="premium-card p-5 bg-brand-surface-alt text-brand-text-primary border-brand-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                    <Landmark size={16} className="text-brand-accent" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                    Minimums
                  </span>
                </div>
                <h4 className="text-sm font-semibold mb-1">Liability Payments</h4>
                <p className="text-xs text-brand-text-muted mb-4">Current minimum monthly payment load.</p>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-mono font-bold">{formatCurrency(totalMinimumPayments)}</span>
                  <button
                    onClick={() => setActiveView('liabilities')}
                    className="text-xs bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                  >
                    Review
                  </button>
                </div>
              </div>

              <div className="premium-card p-5 bg-brand-surface-alt text-brand-text-primary border-brand-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-brand-surface rounded-lg border border-brand-border">
                    <CalendarClock size={16} className="text-violet-400" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                    Upcoming
                  </span>
                </div>
                <h4 className="text-sm font-semibold mb-1">Pending Obligations</h4>
                <p className="text-xs text-brand-text-muted mb-4">Number of unpaid upcoming commitments.</p>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-mono font-bold">{pendingObligations.length}</span>
                  <button
                    onClick={() => setActiveView('obligations')}
                    className="text-xs bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderMoneyFlow = () => (
    <div className="space-y-6">
      <ViewHeader
        title="Money Flow"
        subtitle="Track inflow and outflow activity across accounts and categories."
        action={
          <button
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-bg px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} />
            <span>Add Flow</span>
          </button>
        }
      />

      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-brand-border flex gap-4 bg-black/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search category, account, or note..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-brand-surface border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent/50 focus:border-brand-accent/50 transition-all text-brand-text-primary placeholder:text-brand-text-muted"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20">
                <th className="data-grid-header">Date</th>
                <th className="data-grid-header">Direction</th>
                <th className="data-grid-header">Type</th>
                <th className="data-grid-header">Category</th>
                <th className="data-grid-header">Account</th>
                <th className="data-grid-header text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {moneyFlow.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-brand-surface-alt rounded-full flex items-center justify-center text-brand-text-muted">
                        <ArrowLeftRight size={20} />
                      </div>
                      <p className="text-sm font-medium text-brand-text-secondary">No records found</p>
                      <p className="text-xs text-brand-text-muted">Add your first transaction to see it here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                moneyFlow.map((item) => (
                <tr key={item.id} className="data-grid-row border-brand-border">
                  <td className="text-xs font-mono text-brand-text-muted">{item.date}</td>
                  <td>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        item.direction === 'inflow' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.direction}
                    </span>
                  </td>
                  <td className="text-brand-text-secondary text-xs">{item.flowType}</td>
                  <td className="font-medium text-brand-text-primary">{item.category || '—'}</td>
                  <td className="text-brand-text-muted text-[11px] font-mono">{item.account || '—'}</td>
                  <td
                    className={`text-right font-mono font-bold ${
                      item.direction === 'inflow' ? 'text-brand-accent' : 'text-brand-text-primary'
                    }`}
                  >
                    {item.direction === 'inflow' ? '+' : '-'}
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWealth = () => (
    <div className="space-y-8">
      <ViewHeader
        title="Wealth"
        subtitle="Current asset positions, allocation, and long-term net worth view."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="premium-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-brand-text-primary mb-6">Net Worth Timeline</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wealthData?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.border} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: chartColors.muted }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.surface,
                    borderRadius: '12px',
                    border: `1px solid ${chartColors.border}`,
                    color: chartColors.text,
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                />
                <Line type="monotone" dataKey="netWorth" stroke={chartColors.accent} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-sm font-semibold text-brand-text-primary mb-6">Allocation</h3>
          <div className="space-y-4">
            {(wealthData?.assets || []).map((item) => (
              <div key={item.name} className="flex justify-between items-center p-3 rounded-lg border border-brand-border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-brand-text-secondary">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-brand-text-primary">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card p-6 lg:col-span-3">
          <h3 className="text-sm font-semibold text-brand-text-primary mb-6">Asset Positions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="data-grid-header">Type</th>
                  <th className="data-grid-header">Account</th>
                  <th className="data-grid-header">As Of</th>
                  <th className="data-grid-header text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {(wealthData?.positions || []).map((item) => (
                  <tr key={item.id} className="data-grid-row border-brand-border">
                    <td className="font-medium text-brand-text-primary">{item.assetType}</td>
                    <td className="text-brand-text-secondary">{item.accountName}</td>
                    <td className="text-xs font-mono text-brand-text-muted">{item.asOfDate}</td>
                    <td className="text-right font-mono font-bold text-brand-text-primary">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiabilities = () => (
    <div className="space-y-8">
      <ViewHeader
        title="Liabilities"
        subtitle="Outstanding debts, balances, due dates, and minimum payment burden."
      />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Liabilities"
            value={overviewData?.totalLiabilities || 0}
            icon={CreditCard}
            accentClass="bg-brand-error/10 text-brand-error"
          />
          <StatCard
            label="Minimum Payments"
            value={totalMinimumPayments}
            icon={Landmark}
            accentClass="bg-brand-error/10 text-brand-error"
          />
          <StatCard
            label="Accounts"
            value={liabilities.length}
            icon={Wallet}
            accentClass="bg-brand-accent/10 text-brand-accent"
          />
        </div>

      <div className="premium-card overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-black/10">
          <h3 className="text-sm font-semibold text-brand-text-primary">Liability Accounts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="data-grid-header">Type</th>
                <th className="data-grid-header">Account</th>
                <th className="data-grid-header">Due Date</th>
                <th className="data-grid-header text-right">Minimum</th>
                <th className="data-grid-header text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {liabilities.map((item) => (
                <tr key={item.id} className="data-grid-row border-brand-border">
                  <td className="font-medium text-brand-text-primary">{item.liabilityType}</td>
                  <td className="text-brand-text-secondary">{item.accountName}</td>
                  <td className="text-xs font-mono text-brand-text-muted">{item.dueDate || '—'}</td>
                  <td className="text-right font-mono text-brand-text-secondary">
                    {formatCurrency(item.minimumPayment)}
                  </td>
                  <td className="text-right font-mono font-bold text-brand-text-primary">
                    {formatCurrency(item.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="premium-card p-6">
        <h3 className="text-sm font-semibold text-brand-text-primary mb-4">Due Soon</h3>
        <div className="space-y-3">
          {dueSoonLiabilities.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border border-brand-border">
              <div>
                <p className="text-sm font-medium text-brand-text-primary">{item.accountName}</p>
                <p className="text-xs text-brand-text-muted">{item.liabilityType} · {formatDate(item.dueDate)}</p>
              </div>
              <span className="text-sm font-mono font-bold text-brand-text-primary">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderObligations = () => (
    <div className="space-y-8">
      <ViewHeader
        title="Obligations"
        subtitle="Upcoming commitments and recurring dues that need attention."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {obligations.map((item) => (
          <div key={item.id} className="premium-card p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest leading-none">
                  {item.category || 'General'}
                </span>
                <h4 className="font-bold text-brand-text-primary mt-1">{item.title}</h4>
              </div>
                <div
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    item.status === 'paid'
                      ? 'bg-brand-success/10 text-brand-success'
                      : item.status === 'overdue'
                      ? 'bg-brand-error/10 text-brand-error'
                      : 'bg-brand-warning/10 text-brand-warning'
                  }`}
                >
                  {item.status}
                </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-muted">Due Date</span>
                <span className="font-mono font-bold text-brand-text-secondary">{formatDate(item.dueDate)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-text-muted">Account</span>
                <span className="font-medium text-brand-text-secondary">{item.account || '—'}</span>
              </div>
              <div className="pt-4 border-t border-brand-border flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                    Amount
                  </span>
                  <div className="text-xl font-mono font-bold text-brand-text-primary">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-8">
      <ViewHeader
        title="Reports"
        subtitle="Trends and breakdowns across money flow and portfolio structure."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-brand-text-primary mb-6">Monthly Flow Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.border} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: chartColors.muted }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: chartColors.muted }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.surface,
                    borderRadius: '12px',
                    border: `1px solid ${chartColors.border}`,
                    color: chartColors.text,
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                <Bar dataKey="inflow" fill={chartColors.success} radius={[4, 4, 0, 0]} name="Inflow" />
                <Bar dataKey="outflow" fill={chartColors.error} radius={[4, 4, 0, 0]} name="Outflow" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-sm font-semibold text-brand-text-primary mb-6">Category Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {(reportData?.categoryDistribution || []).map((entry, index) => (
                    <Cell
                      key={`report-cell-${index}`}
                      fill={[chartColors.accent, '#334155', '#475569', '#64748b', '#94a3b8'][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.surface,
                    borderRadius: '12px',
                    border: `1px solid ${chartColors.border}`,
                    color: chartColors.text,
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-6">
          <h3 className="text-sm font-semibold text-brand-text-primary mb-6">Net Flow Snapshot</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-brand-border pb-4">
              <span className="text-xs text-brand-text-muted">Current Net Flow</span>
              <div className="text-right">
                <span className={`text-lg font-bold ${(overviewData?.netFlow || 0) >= 0 ? 'text-brand-accent' : 'text-rose-400'}`}>
                  {formatCurrency(overviewData?.netFlow || 0)}
                </span>
                <p className="text-[10px] text-brand-text-muted">Inflow minus outflow</p>
              </div>
            </div>
            <div className="flex justify-between items-end border-b border-brand-border pb-4">
              <span className="text-xs text-brand-text-muted">Active Obligations</span>
              <div className="text-right">
                <span className="text-lg font-bold text-amber-400">{pendingObligations.length}</span>
                <p className="text-[10px] text-brand-text-muted">Pending or overdue</p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-brand-text-muted">Liability Accounts</span>
              <div className="text-right">
                <span className="text-lg font-bold text-brand-error">{liabilities.length}</span>
                <p className="text-[10px] text-brand-text-muted">Tracked accounts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 max-w-4xl">
      <ViewHeader
        title="Settings"
        subtitle="App configuration, integration values, and environment setup."
      />

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-widest text-[10px]">App Core</h3>
          <div className="premium-card p-6 divide-y divide-brand-border">
            <div className="py-4 first:pt-0 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-brand-text-primary">Base Currency</p>
                <p className="text-xs text-brand-text-muted font-mono uppercase tracking-tighter">
                  Default valuation for all calculations
                </p>
              </div>
              <select className="bg-brand-surface border border-brand-border rounded px-3 py-1.5 text-sm outline-none text-brand-text-secondary focus:border-brand-accent/50">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-brand-text-muted uppercase tracking-widest text-[10px]">Integration</h3>
          <div className="premium-card p-6 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm font-bold text-brand-text-primary">Google Apps Script API</p>
                <p className="text-xs text-brand-text-muted">Use your deployed web app URL here.</p>
              </div>
              <div className="bg-brand-success/10 text-brand-success px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                Connected
              </div>
            </div>
            <input
              type="text"
              readOnly
              value={(import.meta as any).env.VITE_GAS_WEB_APP_URL || ''}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full text-sm font-mono border border-brand-border rounded-lg p-3 bg-brand-surface text-brand-text-primary outline-none focus:border-brand-accent transition-all placeholder:text-brand-text-muted"
            />
            <div>
              <p className="text-sm font-bold text-brand-text-primary">Spreadsheet ID</p>
              <p className="text-xs text-brand-text-muted mb-4">Keep this aligned with your Apps Script config.</p>
              <input
                type="text"
                placeholder="1a2b3c4d..."
                className="w-full text-sm font-mono border border-brand-border rounded-lg p-3 bg-brand-surface text-brand-text-primary outline-none focus:border-brand-accent transition-all placeholder:text-brand-text-muted"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <header className="lg:hidden bg-brand-bg border-b border-brand-border px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-brand-bg" />
          </div>
          <span className="text-lg font-bold tracking-tight text-brand-accent">WealthFlow</span>
        </div>
        <button className="p-2 text-brand-text-muted">
          <MoreVertical size={20} />
        </button>
      </header>

      <aside className="w-[220px] border-r border-brand-border bg-brand-bg p-0 hidden lg:flex flex-col fixed inset-y-0">
        <div className="flex items-center gap-3 py-8 px-6">
          <div className="w-6 h-6 bg-brand-accent rounded shadow-[0_0_10px_rgba(45,212,191,0.3)] flex items-center justify-center">
            <TrendingUp size={14} className="text-brand-bg" />
          </div>
          <span className="text-lg font-bold tracking-tight text-brand-accent">WealthFlow</span>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Overview" active={activeView === 'overview'} onClick={() => setActiveView('overview')} />
            <SidebarItem icon={ArrowLeftRight} label="Money Flow" active={activeView === 'moneyFlow'} onClick={() => setActiveView('moneyFlow')} />
            <SidebarItem icon={Wallet} label="Wealth" active={activeView === 'wealth'} onClick={() => setActiveView('wealth')} />
            <SidebarItem icon={CreditCard} label="Liabilities" active={activeView === 'liabilities'} onClick={() => setActiveView('liabilities')} />
            <SidebarItem icon={CalendarClock} label="Obligations" active={activeView === 'obligations'} onClick={() => setActiveView('obligations')} />
            <SidebarItem icon={BarChart3} label="Reports" active={activeView === 'reports'} onClick={() => setActiveView('reports')} />
          </ul>
        </nav>

        <div className="p-6">
          <SidebarItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </div>
      </aside>

      <main className="flex-1 lg:ml-[220px] min-h-screen flex flex-col">
        <header className="hidden lg:flex h-16 border-b border-brand-border bg-brand-bg px-8 items-center justify-between sticky top-0 z-40">
          <div className="text-sm font-semibold text-brand-text-primary capitalize">
            {activeView === 'moneyFlow' ? 'Money Flow' : activeView}
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 text-brand-text-muted hover:text-brand-text-primary transition-colors hover:bg-brand-surface rounded-lg"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" size={14} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-brand-surface border border-brand-border rounded-lg py-1.5 pl-9 pr-4 text-xs text-brand-text-primary focus:outline-none focus:border-brand-accent/50 transition-all w-48"
              />
            </div>
          </div>
        </header>

        <div className="px-4 py-8 md:px-12 md:py-10 max-w-[1600px] w-full bg-brand-bg">
          {loading ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-2 border-brand-border border-t-brand-accent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
                Loading WealthFlow
              </p>
            </div>
          ) : error ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 bg-brand-error/10 rounded-full flex items-center justify-center text-brand-error">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-text-primary mb-2">Data Sync Failed</h2>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {error}
                </p>
              </div>
              <button
                onClick={loadAllData}
                className="bg-brand-accent text-brand-bg px-6 py-2 rounded-lg text-sm font-bold active:scale-95 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {activeView === 'overview' && renderOverview()}
                {activeView === 'moneyFlow' && renderMoneyFlow()}
                {activeView === 'wealth' && renderWealth()}
                {activeView === 'liabilities' && renderLiabilities()}
                {activeView === 'obligations' && renderObligations()}
                {activeView === 'reports' && renderReports()}
                {activeView === 'settings' && renderSettings()}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showQuickAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickAdd(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 p-8"
            >
              <h2 className="text-xl font-bold mb-3 text-brand-text-primary">Quick Add</h2>
              <p className="text-sm text-brand-text-secondary mb-6">
                We’ll wire this modal to the new create flows in the next step.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button className="premium-card p-4 text-left hover:border-brand-accent transition-all">
                  <div className="text-sm font-semibold text-brand-text-primary">Money Flow</div>
                  <div className="text-xs text-brand-text-muted mt-1">Add inflow or outflow</div>
                </button>
                <button className="premium-card p-4 text-left hover:border-brand-accent transition-all">
                  <div className="text-sm font-semibold text-brand-text-primary">Asset</div>
                  <div className="text-xs text-brand-text-muted mt-1">Add wealth position</div>
                </button>
                <button className="premium-card p-4 text-left hover:border-brand-accent transition-all">
                  <div className="text-sm font-semibold text-brand-text-primary">Obligation</div>
                  <div className="text-xs text-brand-text-muted mt-1">Track upcoming due</div>
                </button>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex-1 bg-brand-surface-alt text-brand-text-secondary border border-brand-border py-3 rounded-lg font-bold text-sm hover:bg-white/5 transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="flex-[2] bg-brand-accent text-brand-bg py-3 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-brand-accent/90 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}