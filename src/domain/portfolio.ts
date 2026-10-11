import {
  calculateLedger,
  type LedgerState,
  type StrategySettings,
} from "./ledger";

export interface Investment {
  id: string;
  amount: number;
  recordedAt: string;
}

export interface ClosedLedgerStats {
  startingBalance: number;
  finalBalance: number;
  netResult: number;
  totalStaked: number;
  wins: number;
  losses: number;
  winRate: number;
  closedSequences: number;
}

export interface ClosedLedger {
  id: string;
  ledger: LedgerState;
  openedAt: string;
  closedAt: string;
  stats: ClosedLedgerStats;
}

export interface Portfolio {
  activeOpenedAt: string | null;
  investments: Investment[];
  closedLedgers: ClosedLedger[];
}

export interface FundsOverview {
  totalInvested: number;
  realisedResult: number;
  availableFunds: number;
}

export interface HistoryEvent {
  id: string;
  kind: "investment" | "ledger-opened" | "ledger-closed";
  at: string;
  title: string;
  amount?: number;
}

export type PortfolioResult =
  | { ok: true; portfolio: Portfolio }
  | { ok: false; error: string };

const CENTS = 100;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * CENTS) / CENTS;
}

function formatAmount(value: number, currency: StrategySettings["currency"]): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value);
}

export function summariseLedger(ledger: LedgerState): ClosedLedgerStats {
  const calculation = calculateLedger(ledger.bets, ledger.settings);
  return {
    startingBalance: ledger.settings.startingBalance,
    finalBalance: roundMoney(calculation.settledBalance),
    netResult: roundMoney(calculation.settledProfit),
    totalStaked: roundMoney(calculation.totalStaked),
    wins: calculation.wins,
    losses: calculation.losses,
    winRate: calculation.winRate,
    closedSequences: calculation.closedSequences,
  };
}

export interface LedgerCard {
  id: string;
  number: number;
  name: string;
  currency: StrategySettings["currency"];
  openedAt: string;
  closedAt: string | null;
  stats: ClosedLedgerStats;
  profitPercent: number;
}

export function profitPercent(netResult: number, startingBalance: number): number {
  if (startingBalance <= 0) return 0;
  return Math.round((netResult / startingBalance) * 10000) / 10000;
}

export function ledgerCards(portfolio: Portfolio, activeLedger: LedgerState): LedgerCard[] {
  const cards: LedgerCard[] = portfolio.closedLedgers.map((closed, index) => ({
    id: closed.id,
    number: index + 1,
    name: closed.ledger.ledgerName,
    currency: closed.ledger.settings.currency,
    openedAt: closed.openedAt,
    closedAt: closed.closedAt,
    stats: closed.stats,
    profitPercent: profitPercent(closed.stats.netResult, closed.stats.startingBalance),
  }));
  if (portfolio.activeOpenedAt !== null) {
    const stats = summariseLedger(activeLedger);
    cards.push({
      id: "active-ledger",
      number: portfolio.closedLedgers.length + 1,
      name: activeLedger.ledgerName,
      currency: activeLedger.settings.currency,
      openedAt: portfolio.activeOpenedAt,
      closedAt: null,
      stats,
      profitPercent: profitPercent(stats.netResult, stats.startingBalance),
    });
  }
  return cards.sort((a, b) => b.openedAt.localeCompare(a.openedAt));
}

export function fundsOverview(
  portfolio: Portfolio,
  activeStartingBalance: number,
): FundsOverview {
  const totalInvested = roundMoney(
    portfolio.investments.reduce((sum, investment) => sum + investment.amount, 0),
  );
  const realisedResult = roundMoney(
    portfolio.closedLedgers.reduce((sum, closed) => sum + closed.stats.netResult, 0),
  );
  const committed = portfolio.activeOpenedAt === null ? 0 : activeStartingBalance;
  return {
    totalInvested,
    realisedResult,
    availableFunds: roundMoney(totalInvested + realisedResult - committed),
  };
}

export function addInvestment(
  portfolio: Portfolio,
  amount: number,
  recordedAt: string,
  id: string,
): PortfolioResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Investment must be above zero." };
  }
  return {
    ok: true,
    portfolio: {
      ...portfolio,
      investments: [...portfolio.investments, { id, amount: roundMoney(amount), recordedAt }],
    },
  };
}

export function closeLedger(
  portfolio: Portfolio,
  ledger: LedgerState,
  closedAt: string,
  id: string,
): PortfolioResult {
  if (portfolio.activeOpenedAt === null) {
    return { ok: false, error: "There is no active ledger to close." };
  }
  if (ledger.bets.some((bet) => bet.outcome === "open")) {
    return { ok: false, error: "Settle every open bet before closing the ledger." };
  }
  return {
    ok: true,
    portfolio: {
      ...portfolio,
      activeOpenedAt: null,
      closedLedgers: [
        ...portfolio.closedLedgers,
        {
          id,
          ledger,
          openedAt: portfolio.activeOpenedAt,
          closedAt,
          stats: summariseLedger(ledger),
        },
      ],
    },
  };
}

export function validateNewLedgerSettings(settings: StrategySettings): string | null {
  const positive = [
    settings.startingBalance,
    settings.baseStake,
    settings.threshold,
    settings.recoveryWeight,
    settings.maxStake,
    settings.maxOpenExposure,
  ];
  if (positive.some((value) => !Number.isFinite(value) || value <= 0)) {
    return "Settings must contain positive numbers.";
  }
  if (!Number.isFinite(settings.goalRate) || settings.goalRate <= 0 || settings.goalRate > 1) {
    return "Goal rate must be between 1% and 100%.";
  }
  if (
    !Number.isInteger(settings.stakeRounding) ||
    settings.stakeRounding < 0 ||
    settings.stakeRounding > 4
  ) {
    return "Stake rounding must be a whole number from 0 to 4.";
  }
  if (settings.maxStake < settings.baseStake) {
    return "The maximum stake cannot be below the base stake.";
  }
  return null;
}

export function startLedger(
  portfolio: Portfolio,
  ledgerName: string,
  settings: StrategySettings,
  openedAt: string,
): { ok: true; portfolio: Portfolio; ledger: LedgerState } | { ok: false; error: string } {
  if (portfolio.activeOpenedAt !== null) {
    return { ok: false, error: "Close the active ledger before starting another." };
  }
  if (ledgerName.trim().length === 0) {
    return { ok: false, error: "Give the new ledger a name." };
  }
  const settingsError = validateNewLedgerSettings(settings);
  if (settingsError) {
    return { ok: false, error: settingsError };
  }
  const { availableFunds } = fundsOverview(portfolio, 0);
  if (roundMoney(settings.startingBalance) > availableFunds) {
    return {
      ok: false,
      error: `Starting balance cannot exceed the available funds of ${formatAmount(
        Math.max(availableFunds, 0),
        settings.currency,
      )}.`,
    };
  }
  return {
    ok: true,
    portfolio: { ...portfolio, activeOpenedAt: openedAt },
    ledger: { ledgerName: ledgerName.trim(), settings, bets: [] },
  };
}

export function historyEvents(
  portfolio: Portfolio,
  activeLedgerName: string,
): HistoryEvent[] {
  const events: HistoryEvent[] = [
    ...portfolio.investments.map((investment): HistoryEvent => ({
      id: investment.id,
      kind: "investment",
      at: investment.recordedAt,
      title: "Investment",
      amount: investment.amount,
    })),
    ...portfolio.closedLedgers.flatMap((closed): HistoryEvent[] => [
      {
        id: `${closed.id}-opened`,
        kind: "ledger-opened",
        at: closed.openedAt,
        title: `Ledger opened · ${closed.ledger.ledgerName}`,
      },
      {
        id: `${closed.id}-closed`,
        kind: "ledger-closed",
        at: closed.closedAt,
        title: `Ledger closed · ${closed.ledger.ledgerName}`,
      },
    ]),
  ];
  if (portfolio.activeOpenedAt !== null) {
    events.push({
      id: "active-opened",
      kind: "ledger-opened",
      at: portfolio.activeOpenedAt,
      title: `Ledger opened · ${activeLedgerName}`,
    });
  }
  return events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => (a.event.at === b.event.at ? b.index - a.index : a.event.at < b.event.at ? 1 : -1))
    .map(({ event }) => event);
}

export function migrateToPortfolio(
  ledger: LedgerState,
  nowIso: string,
  investmentId: string,
): Portfolio {
  return {
    activeOpenedAt: nowIso,
    investments: [
      {
        id: investmentId,
        amount: roundMoney(ledger.settings.startingBalance),
        recordedAt: nowIso,
      },
    ],
    closedLedgers: [],
  };
}
