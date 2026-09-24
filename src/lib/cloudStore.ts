import type { Session, User } from "@supabase/supabase-js";
import type {
  BetStrategy,
  Currency,
  LedgerState,
  Outcome,
  StrategySettings,
  UnstampedBet,
} from "../domain/ledger";
import { stampBets } from "../domain/ledger";
import { supabase } from "./supabase";

interface CloudLedgerRow {
  id: string;
  name: string;
  settings: unknown;
}

export interface CloudLedger {
  ledgerId: string;
  ledger: LedgerState;
}

function getClient() {
  if (!supabase) {
    throw new Error("Cloud sync is not configured for this deployment.");
  }

  return supabase;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(value: unknown, field: string): number {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Cloud data contains an invalid ${field} value.`);
  }

  return numberValue;
}

function readPositiveNumber(value: unknown, field: string): number {
  const numberValue = readNumber(value, field);
  if (numberValue <= 0) {
    throw new Error(`Cloud data contains an invalid ${field} value.`);
  }

  return numberValue;
}

function readCurrency(value: unknown): Currency {
  if (value === "EUR" || value === "GBP" || value === "USD") {
    return value;
  }

  throw new Error("Cloud data contains an invalid currency value.");
}

function readOutcome(value: unknown): Outcome {
  if (value === "open" || value === "won" || value === "lost") {
    return value;
  }

  throw new Error("Cloud data contains an invalid outcome value.");
}

function settingsFromCloud(value: unknown): StrategySettings {
  if (!isRecord(value)) {
    throw new Error("Cloud data contains invalid FairBets settings.");
  }

  const goalRate = readNumber(value.goalRate, "goal rate");
  const recoveryWeight = readPositiveNumber(value.recoveryWeight, "recovery weight");
  const stakeRounding = readNumber(value.stakeRounding, "stake rounding");
  const baseStake = readPositiveNumber(value.baseStake, "base stake");
  const maxStake = readPositiveNumber(value.maxStake, "maximum stake");

  if (goalRate <= 0 || goalRate > 1) {
    throw new Error("Cloud data contains an invalid goal rate.");
  }
  if (recoveryWeight > 1) {
    throw new Error("Cloud data contains an invalid recovery weight.");
  }
  if (!Number.isInteger(stakeRounding) || stakeRounding < 0 || stakeRounding > 4) {
    throw new Error("Cloud data contains invalid stake rounding.");
  }
  if (maxStake < baseStake) {
    throw new Error("Cloud data contains a maximum stake below the base stake.");
  }

  return {
    startingBalance: readPositiveNumber(value.startingBalance, "starting balance"),
    baseStake,
    goalRate,
    threshold: readPositiveNumber(value.threshold, "threshold"),
    recoveryWeight,
    stakeRounding,
    maxStake,
    maxOpenExposure: readPositiveNumber(value.maxOpenExposure, "maximum open exposure"),
    currency: readCurrency(value.currency),
  };
}

function optionalPositiveNumber(value: unknown, label: string): number | undefined {
  return value === null || value === undefined ? undefined : readPositiveNumber(value, label);
}

function strategyFromCloud(value: Record<string, unknown>): BetStrategy | undefined {
  const baseStake = optionalPositiveNumber(value.base_stake, "recorded base stake");
  const threshold = optionalPositiveNumber(value.threshold, "recorded threshold");
  const maxStake = optionalPositiveNumber(value.max_stake, "recorded maximum stake");
  const recoveryWeight = value.recovery_weight;
  const stakeRounding = value.stake_rounding;

  if (
    baseStake === undefined ||
    threshold === undefined ||
    maxStake === undefined ||
    typeof recoveryWeight !== "number" ||
    typeof stakeRounding !== "number"
  ) {
    return undefined;
  }

  return { baseStake, threshold, recoveryWeight, stakeRounding, maxStake };
}

function betFromCloud(value: unknown): UnstampedBet {
  if (!isRecord(value)) {
    throw new Error("Cloud data contains an invalid bet.");
  }

  const id = value.id;
  const placedAt = value.placed_at;
  const label = value.label;
  const stakeOverride = value.stake_override;

  if (typeof id !== "string" || typeof placedAt !== "string" || typeof label !== "string") {
    throw new Error("Cloud data contains an incomplete bet.");
  }

  const parsedStakeOverride = optionalPositiveNumber(stakeOverride, "stake override");
  const odds = readPositiveNumber(value.odds, "odds");
  if (odds <= 1) {
    throw new Error("Cloud data contains invalid odds.");
  }

  const strategy = strategyFromCloud(value);

  return {
    id,
    placedAt,
    label,
    odds,
    outcome: readOutcome(value.outcome),
    ...(parsedStakeOverride === undefined ? {} : { stakeOverride: parsedStakeOverride }),
    ...(strategy === undefined ? {} : { strategy }),
  };
}

function ledgerFromCloud(value: unknown): CloudLedgerRow {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    !("settings" in value)
  ) {
    throw new Error("Cloud data contains an invalid FairBets ledger.");
  }

  return {
    id: value.id,
    name: value.name,
    settings: value.settings,
  };
}

async function getAuthenticatedUser(): Promise<User> {
  const client = getClient();
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw new Error(`Cloud authentication failed: ${error.message}`);
  }
  if (!data.user) {
    throw new Error("Sign in before using cloud sync.");
  }

  return data.user;
}

export async function getCloudSession(): Promise<Session | null> {
  const client = getClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(`Cloud session could not be loaded: ${error.message}`);
  }

  return data.session;
}

export function subscribeToCloudAuthChanges(
  onSessionChange: (session: Session | null) => void,
): () => void {
  const client = getClient();
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    onSessionChange(session);
  });

  return () => subscription.unsubscribe();
}

export async function sendMagicLink(email: string): Promise<void> {
  const client = getClient();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    throw new Error(`Sign-in link could not be sent: ${error.message}`);
  }
}

export async function signOutFromCloud(): Promise<void> {
  const client = getClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
}

export async function loadLatestCloudLedger(): Promise<CloudLedger | null> {
  const client = getClient();
  await getAuthenticatedUser();
  const { data: ledgerData, error: ledgerError } = await client
    .from("ledgers")
    .select("id,name,settings")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (ledgerError) {
    throw new Error(`Cloud ledger could not be loaded: ${ledgerError.message}`);
  }

  const latestLedgerData = Array.isArray(ledgerData) ? ledgerData[0] : undefined;
  if (!latestLedgerData) {
    return null;
  }

  const ledger = ledgerFromCloud(latestLedgerData);
  const { data: betData, error: betError } = await client
    .from("bets")
    .select(
      "id,placed_at,label,odds,outcome,stake_override,base_stake,threshold,recovery_weight,stake_rounding,max_stake",
    )
    .eq("ledger_id", ledger.id)
    .order("placed_at", { ascending: true });

  if (betError) {
    throw new Error(`Cloud bets could not be loaded: ${betError.message}`);
  }
  if (!Array.isArray(betData)) {
    throw new Error("Cloud bets could not be read.");
  }

  const settings = settingsFromCloud(ledger.settings);

  return {
    ledgerId: ledger.id,
    ledger: {
      ledgerName: ledger.name,
      settings,
      bets: stampBets(betData.map(betFromCloud), settings),
    },
  };
}

export async function saveLedgerToCloud(
  ledger: LedgerState,
  existingLedgerId: string | null,
): Promise<string> {
  const client = getClient();
  const user = await getAuthenticatedUser();
  const ledgerPayload = {
    name: ledger.ledgerName,
    settings: ledger.settings,
  };

  let ledgerId: string;
  if (existingLedgerId) {
    const { data, error } = await client
      .from("ledgers")
      .update(ledgerPayload)
      .eq("id", existingLedgerId)
      .eq("owner_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new Error(`Cloud ledger could not be saved: ${error.message}`);
    }
    if (!isRecord(data) || typeof data.id !== "string") {
      throw new Error("The selected cloud ledger is no longer available.");
    }
    ledgerId = data.id;
  } else {
    const { data, error } = await client
      .from("ledgers")
      .insert({ ...ledgerPayload, owner_id: user.id })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Cloud ledger could not be created: ${error.message}`);
    }
    if (!isRecord(data) || typeof data.id !== "string") {
      throw new Error("Cloud storage did not return a new ledger ID.");
    }
    ledgerId = data.id;
  }

  if (ledger.bets.length > 0) {
    const { error } = await client.from("bets").upsert(
      ledger.bets.map((bet) => ({
        id: bet.id,
        ledger_id: ledgerId,
        placed_at: bet.placedAt,
        label: bet.label,
        odds: bet.odds,
        outcome: bet.outcome,
        stake_override: bet.stakeOverride ?? null,
        base_stake: bet.strategy.baseStake,
        threshold: bet.strategy.threshold,
        recovery_weight: bet.strategy.recoveryWeight,
        stake_rounding: bet.strategy.stakeRounding,
        max_stake: bet.strategy.maxStake,
      })),
      { onConflict: "id" },
    );

    if (error) {
      throw new Error(`Cloud bets could not be saved: ${error.message}`);
    }
  }

  const { data: existingBets, error: existingBetsError } = await client
    .from("bets")
    .select("id")
    .eq("ledger_id", ledgerId);

  if (existingBetsError) {
    throw new Error(`Cloud bets could not be checked: ${existingBetsError.message}`);
  }
  if (!Array.isArray(existingBets)) {
    throw new Error("Cloud bet records could not be read.");
  }

  const currentBetIds = new Set(ledger.bets.map((bet) => bet.id));
  const staleBetIds = existingBets.flatMap((bet) =>
    isRecord(bet) && typeof bet.id === "string" && !currentBetIds.has(bet.id)
      ? [bet.id]
      : [],
  );

  if (staleBetIds.length > 0) {
    const { error } = await client.from("bets").delete().in("id", staleBetIds);
    if (error) {
      throw new Error(`Stale cloud bets could not be removed: ${error.message}`);
    }
  }

  return ledgerId;
}
