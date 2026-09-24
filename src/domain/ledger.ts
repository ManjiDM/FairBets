export type Currency = "EUR" | "GBP" | "USD";

export type Outcome = "open" | "won" | "lost";
export type SequenceStatus = "active" | "closed";

export interface BetStrategy {
  baseStake: number;
  threshold: number;
  recoveryWeight: number;
  stakeRounding: number;
  maxStake: number;
}

export interface Bet {
  id: string;
  placedAt: string;
  label: string;
  odds: number;
  outcome: Outcome;
  stakeOverride?: number;
  strategy: BetStrategy;
}

export type UnstampedBet = Omit<Bet, "strategy"> & { strategy?: BetStrategy };

export interface StrategySettings {
  startingBalance: number;
  baseStake: number;
  goalRate: number;
  threshold: number;
  recoveryWeight: number;
  stakeRounding: number;
  maxStake: number;
  maxOpenExposure: number;
  currency: Currency;
}

export interface LedgerState {
  ledgerName: string;
  settings: StrategySettings;
  bets: Bet[];
}

export interface StakeSuggestion {
  amount: number;
  baseStake: number;
  recoveryOffset: number;
  recoveryNeed: number;
  capped: boolean;
}

export interface CalculatedBet extends Bet {
  index: number;
  sequenceId: string;
  sequenceNumber: number;
  sequencePosition: number;
  baseStake: number;
  recoveryOffset: number;
  stake: number;
  potentialProfit: number;
  profit: number;
  expectedProfit: number;
  cumulativeExpected: number;
  cumulativeProfit: number;
  recoveryGap: number;
  capped: boolean;
  overStakeLimit: boolean;
}

export interface BetSequence {
  id: string;
  number: number;
  status: SequenceStatus;
  startedAt: string;
  endedAt?: string;
  bets: CalculatedBet[];
  totalStaked: number;
  profit: number;
  expectedProfit: number;
  recoveryGap: number;
  openExposure: number;
  largestStake: number;
}

export interface LedgerCalculation {
  bets: CalculatedBet[];
  sequences: BetSequence[];
  activeSequence: BetSequence | null;
  settledProfit: number;
  expectedProfit: number;
  openExposure: number;
  settledBalance: number;
  availableBalance: number;
  totalStaked: number;
  largestStake: number;
  goal: number;
  goalProgress: number;
  recoveryGap: number;
  nextOddsGuide: number;
  nextSuggestion: StakeSuggestion;
  wins: number;
  losses: number;
  open: number;
  winRate: number;
  closedSequences: number;
  riskFlags: string[];
}

interface SequenceAccumulator {
  id: string;
  number: number;
  status: SequenceStatus;
  startedAt: string;
  endedAt?: string;
  bets: CalculatedBet[];
  expectedProfitUnits: number;
  profitUnits: number;
  openExposureUnits: number;
  totalStakedUnits: number;
  largestStakeUnits: number;
}

const MONEY_DECIMALS = 4;
const MONEY_SCALE = 10 ** MONEY_DECIMALS;
const ODDS_SCALE = 10_000;

export const defaultSettings: StrategySettings = {
  startingBalance: 37.92,
  baseStake: 0.1,
  goalRate: 0.75,
  threshold: 0.5,
  recoveryWeight: 0.5,
  stakeRounding: 1,
  maxStake: 15,
  maxOpenExposure: 5,
  currency: "EUR",
};

function toMoneyUnits(value: number): number {
  return Number.isFinite(value) ? Math.round(value * MONEY_SCALE) : 0;
}

function fromMoneyUnits(value: number): number {
  return value / MONEY_SCALE;
}

function toOddsUnits(value: number): number {
  return Number.isFinite(value) ? Math.round(value * ODDS_SCALE) : 0;
}

function roundUpMoneyUnits(value: number, decimals: number): number {
  const safeDecimals = Math.max(0, Math.min(MONEY_DECIMALS, Math.trunc(decimals)));
  const increment = 10 ** (MONEY_DECIMALS - safeDecimals);
  return Math.ceil(value / increment) * increment;
}

function ceilDivide(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.ceil(numerator / denominator) : 0;
}

function stakeProfitUnits(stakeUnits: number, odds: number): number {
  const marginUnits = toOddsUnits(odds) - ODDS_SCALE;
  return marginUnits > 0 ? Math.trunc((stakeUnits * marginUnits) / ODDS_SCALE) : 0;
}

function validStakeOverride(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function compareBets(left: Bet, right: Bet): number {
  const dateDifference = new Date(left.placedAt).getTime() - new Date(right.placedAt).getTime();
  if (Number.isFinite(dateDifference) && dateDifference !== 0) {
    return dateDifference;
  }

  return left.id.localeCompare(right.id);
}

function createSequence(number: number, bet: Bet): SequenceAccumulator {
  return {
    id: `sequence-${number}-${bet.id}`,
    number,
    status: "active",
    startedAt: bet.placedAt,
    bets: [],
    expectedProfitUnits: 0,
    profitUnits: 0,
    openExposureUnits: 0,
    totalStakedUnits: 0,
    largestStakeUnits: 0,
  };
}

function toBetSequence(sequence: SequenceAccumulator): BetSequence {
  return {
    id: sequence.id,
    number: sequence.number,
    status: sequence.status,
    startedAt: sequence.startedAt,
    ...(sequence.endedAt ? { endedAt: sequence.endedAt } : {}),
    bets: sequence.bets,
    totalStaked: fromMoneyUnits(sequence.totalStakedUnits),
    profit: fromMoneyUnits(sequence.profitUnits),
    expectedProfit: fromMoneyUnits(sequence.expectedProfitUnits),
    recoveryGap: fromMoneyUnits(
      Math.max(0, sequence.expectedProfitUnits - sequence.profitUnits),
    ),
    openExposure: fromMoneyUnits(sequence.openExposureUnits),
    largestStake: fromMoneyUnits(sequence.largestStakeUnits),
  };
}

export function pickStrategy(settings: StrategySettings): BetStrategy {
  return {
    baseStake: settings.baseStake,
    threshold: settings.threshold,
    recoveryWeight: settings.recoveryWeight,
    stakeRounding: settings.stakeRounding,
    maxStake: settings.maxStake,
  };
}

export function stampBets(bets: UnstampedBet[], settings: StrategySettings): Bet[] {
  return bets.map((bet) => ({
    ...bet,
    strategy: bet.strategy ? { ...bet.strategy } : pickStrategy(settings),
  }));
}

export function suggestStakeForOdds(
  recoveryGap: number,
  odds: number,
  strategy: BetStrategy,
): StakeSuggestion {
  const baseStakeUnits = toMoneyUnits(strategy.baseStake);
  const maxStakeUnits = Math.max(baseStakeUnits, toMoneyUnits(strategy.maxStake));
  const thresholdUnits = toMoneyUnits(strategy.threshold);
  const gapUnits = Math.max(0, toMoneyUnits(recoveryGap));
  const oddsMarginUnits = toOddsUnits(odds) - ODDS_SCALE;

  if (oddsMarginUnits <= 0) {
    return {
      amount: fromMoneyUnits(baseStakeUnits),
      baseStake: fromMoneyUnits(baseStakeUnits),
      recoveryOffset: 0,
      recoveryNeed: fromMoneyUnits(gapUnits),
      capped: false,
    };
  }

  const requiredRecoveryUnits = roundUpMoneyUnits(
    ceilDivide(gapUnits * ODDS_SCALE, oddsMarginUnits),
    strategy.stakeRounding,
  );
  const weight = requiredRecoveryUnits >= thresholdUnits ? strategy.recoveryWeight : 1;
  const weightedRecoveryUnits = Math.max(0, Math.trunc(requiredRecoveryUnits * weight));
  const requestedStakeUnits = baseStakeUnits + weightedRecoveryUnits;
  const suggestedStakeUnits = Math.min(requestedStakeUnits, maxStakeUnits);

  return {
    amount: fromMoneyUnits(suggestedStakeUnits),
    baseStake: fromMoneyUnits(baseStakeUnits),
    recoveryOffset: fromMoneyUnits(weightedRecoveryUnits),
    recoveryNeed: fromMoneyUnits(gapUnits),
    capped: requestedStakeUnits > maxStakeUnits,
  };
}

export function calculateLedger(bets: Bet[], settings: StrategySettings): LedgerCalculation {
  const orderedBets = [...bets].sort(compareBets);
  const currentMaxStakeUnits = Math.max(
    toMoneyUnits(settings.baseStake),
    toMoneyUnits(settings.maxStake),
  );
  const sequenceAccumulators: SequenceAccumulator[] = [];
  const calculatedBets: CalculatedBet[] = [];
  let currentSequence: SequenceAccumulator | null = null;
  let totalExpectedUnits = 0;
  let totalProfitUnits = 0;
  let totalOpenExposureUnits = 0;
  let totalStakedUnits = 0;
  let largestStakeUnits = 0;
  let wins = 0;
  let losses = 0;
  let open = 0;

  for (const [index, bet] of orderedBets.entries()) {
    if (!currentSequence) {
      currentSequence = createSequence(sequenceAccumulators.length + 1, bet);
      sequenceAccumulators.push(currentSequence);
    }

    const safeOdds = bet.odds > 1 && Number.isFinite(bet.odds) ? bet.odds : 1.01;
    const baseStakeUnits = toMoneyUnits(bet.strategy.baseStake);
    const recoveryBeforeUnits = Math.max(
      0,
      currentSequence.expectedProfitUnits - currentSequence.profitUnits,
    );
    const suggestion = suggestStakeForOdds(
      fromMoneyUnits(recoveryBeforeUnits),
      safeOdds,
      bet.strategy,
    );
    const stakeUnits = validStakeOverride(bet.stakeOverride)
      ? toMoneyUnits(bet.stakeOverride)
      : toMoneyUnits(suggestion.amount);
    const potentialProfitUnits = stakeProfitUnits(stakeUnits, safeOdds);
    const expectedProfitUnits =
      bet.outcome === "open" ? 0 : stakeProfitUnits(baseStakeUnits, safeOdds);
    const profitUnits =
      bet.outcome === "won"
        ? potentialProfitUnits
        : bet.outcome === "lost"
          ? -stakeUnits
          : 0;

    if (bet.outcome === "open") {
      open += 1;
      currentSequence.openExposureUnits += stakeUnits;
      totalOpenExposureUnits += stakeUnits;
    } else {
      currentSequence.expectedProfitUnits += expectedProfitUnits;
      currentSequence.profitUnits += profitUnits;
      totalExpectedUnits += expectedProfitUnits;
      totalProfitUnits += profitUnits;
      if (bet.outcome === "won") {
        wins += 1;
      } else {
        losses += 1;
      }
    }

    currentSequence.totalStakedUnits += stakeUnits;
    currentSequence.largestStakeUnits = Math.max(
      currentSequence.largestStakeUnits,
      stakeUnits,
    );
    totalStakedUnits += stakeUnits;
    largestStakeUnits = Math.max(largestStakeUnits, stakeUnits);
    const recoveryGapUnits = Math.max(
      0,
      currentSequence.expectedProfitUnits - currentSequence.profitUnits,
    );
    const calculatedBet: CalculatedBet = {
      ...bet,
      odds: safeOdds,
      index: index + 1,
      sequenceId: currentSequence.id,
      sequenceNumber: currentSequence.number,
      sequencePosition: currentSequence.bets.length + 1,
      baseStake: fromMoneyUnits(baseStakeUnits),
      recoveryOffset: suggestion.recoveryOffset,
      stake: fromMoneyUnits(stakeUnits),
      potentialProfit: fromMoneyUnits(potentialProfitUnits),
      profit: fromMoneyUnits(profitUnits),
      expectedProfit: fromMoneyUnits(expectedProfitUnits),
      cumulativeExpected: fromMoneyUnits(currentSequence.expectedProfitUnits),
      cumulativeProfit: fromMoneyUnits(currentSequence.profitUnits),
      recoveryGap: fromMoneyUnits(recoveryGapUnits),
      capped: suggestion.capped,
      overStakeLimit: stakeUnits > currentMaxStakeUnits,
    };

    currentSequence.bets.push(calculatedBet);
    calculatedBets.push(calculatedBet);

    if (bet.outcome === "won") {
      currentSequence.status = "closed";
      currentSequence.endedAt = bet.placedAt;
      currentSequence = null;
    }
  }

  const sequences = sequenceAccumulators.map(toBetSequence);
  const activeSequence = sequences.findLast((sequence) => sequence.status === "active") ?? null;
  const nextOddsGuide = calculatedBets.at(-1)?.odds ?? 1.3;
  const nextSuggestion = suggestStakeForOdds(
    activeSequence?.recoveryGap ?? 0,
    nextOddsGuide,
    settings,
  );
  const settledProfit = fromMoneyUnits(totalProfitUnits);
  const expectedProfit = fromMoneyUnits(totalExpectedUnits);
  const openExposure = fromMoneyUnits(totalOpenExposureUnits);
  const settledBalance = settings.startingBalance + settledProfit;
  const goal = expectedProfit * settings.goalRate;
  const riskFlags: string[] = [];

  if (totalOpenExposureUnits > toMoneyUnits(settings.maxOpenExposure)) {
    riskFlags.push("Open exposure is above the limit you set.");
  }
  if (nextSuggestion.capped) {
    riskFlags.push("The next suggested stake reaches your stake limit.");
  }
  if (calculatedBets.some((bet) => bet.overStakeLimit)) {
    riskFlags.push("At least one recorded stake is above your current stake limit.");
  }

  return {
    bets: calculatedBets,
    sequences,
    activeSequence,
    settledProfit,
    expectedProfit,
    openExposure,
    settledBalance,
    availableBalance: settledBalance - openExposure,
    totalStaked: fromMoneyUnits(totalStakedUnits),
    largestStake: fromMoneyUnits(largestStakeUnits),
    goal,
    goalProgress: goal > 0 ? settledProfit / goal : 0,
    recoveryGap: activeSequence?.recoveryGap ?? 0,
    nextOddsGuide,
    nextSuggestion,
    wins,
    losses,
    open,
    winRate: wins + losses > 0 ? wins / (wins + losses) : 0,
    closedSequences: sequences.filter((sequence) => sequence.status === "closed").length,
    riskFlags,
  };
}

export function createBlankLedger(): LedgerState {
  return {
    ledgerName: "New FairBets ledger",
    settings: { ...defaultSettings },
    bets: [],
  };
}

export function createDemoLedger(): LedgerState {
  const demoBets: UnstampedBet[] = [
    {
      id: "demo-01",
      placedAt: "2026-09-01T09:30",
      label: "Selection 01",
      odds: 1.28,
      outcome: "won",
    },
    {
      id: "demo-02",
      placedAt: "2026-09-02T12:15",
      label: "Selection 02",
      odds: 1.35,
      outcome: "lost",
    },
    {
      id: "demo-03",
      placedAt: "2026-09-03T15:45",
      label: "Selection 03",
      odds: 1.24,
      outcome: "won",
    },
    {
      id: "demo-04",
      placedAt: "2026-09-04T18:00",
      label: "Selection 04",
      odds: 1.42,
      outcome: "lost",
    },
    {
      id: "demo-05",
      placedAt: "2026-09-05T11:10",
      label: "Selection 05",
      odds: 1.31,
      outcome: "won",
    },
    {
      id: "demo-06",
      placedAt: "2026-09-06T14:25",
      label: "Selection 06",
      odds: 1.27,
      outcome: "won",
    },
    {
      id: "demo-07",
      placedAt: "2026-09-07T16:20",
      label: "Selection 07",
      odds: 1.23,
      outcome: "lost",
    },
    {
      id: "demo-08",
      placedAt: "2026-09-08T10:00",
      label: "Selection 08",
      odds: 1.38,
      outcome: "won",
    },
  ];

  return {
    ledgerName: "FairBets demo",
    settings: { ...defaultSettings },
    bets: stampBets(demoBets, defaultSettings),
  };
}
