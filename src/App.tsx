import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import "./App.css";
import {
  calculateLedger,
  createBlankLedger,
  createDemoLedger,
  type Bet,
  type BetSequence,
  type CalculatedBet,
  type Currency,
  type LedgerState,
  type Outcome,
  type StrategySettings,
  suggestStakeForOdds,
} from "./domain/ledger";
import { importWorkbook } from "./domain/workbookImport";
import {
  getCloudSession,
  loadLatestCloudLedger,
  saveLedgerToCloud,
  sendMagicLink,
  signOutFromCloud,
  subscribeToCloudAuthChanges,
} from "./lib/cloudStore";
import {
  isSupabaseConfigured,
  supabaseConfigurationError,
} from "./lib/supabase";

type Tab = "overview" | "history" | "settings";
type HistoryFilter = "all" | "active" | "closed";
type SettledOutcome = Exclude<Outcome, "open">;
type CloudStatus =
  | "unconfigured"
  | "checking"
  | "signed-out"
  | "sending-link"
  | "ready"
  | "syncing"
  | "synced"
  | "error";
type NumericSetting =
  | "startingBalance"
  | "baseStake"
  | "goalRate"
  | "threshold"
  | "recoveryWeight"
  | "stakeRounding"
  | "maxStake"
  | "maxOpenExposure";

interface BetDraft {
  label: string;
  placedAt: string;
  odds: string;
  outcome: Outcome;
  stakeOverride: string;
}

interface Feedback {
  tone: "success" | "warning" | "error";
  text: string;
}

interface LoadedLedger {
  state: LedgerState;
  feedback: Feedback | null;
}

const STORAGE_KEY = "fairbets-ledger-state-v2";
const LEGACY_STORAGE_KEY = "series-ledger-state-v1";
const CLOUD_LINK_USER_KEY = "fairbets-cloud-user-v2";
const CLOUD_LINK_LEDGER_KEY = "fairbets-cloud-ledger-v2";
const LEGACY_CLOUD_LINK_USER_KEY = "series-ledger-cloud-user-v1";
const LEGACY_CLOUD_LINK_SERIES_KEY = "series-ledger-cloud-series-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOutcome(value: unknown): value is Outcome {
  return value === "open" || value === "won" || value === "lost";
}

function isCurrency(value: unknown): value is Currency {
  return value === "EUR" || value === "GBP" || value === "USD";
}

function isSettings(value: unknown): value is StrategySettings {
  if (!isRecord(value) || !isCurrency(value.currency)) {
    return false;
  }

  const numericKeys: NumericSetting[] = [
    "startingBalance",
    "baseStake",
    "goalRate",
    "threshold",
    "recoveryWeight",
    "stakeRounding",
    "maxStake",
    "maxOpenExposure",
  ];

  return numericKeys.every(
    (key) => typeof value[key] === "number" && Number.isFinite(value[key]),
  );
}

function isBet(value: unknown): value is Bet {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.placedAt === "string" &&
    typeof value.label === "string" &&
    typeof value.odds === "number" &&
    isOutcome(value.outcome) &&
    (value.stakeOverride === undefined || typeof value.stakeOverride === "number")
  );
}

function isLedgerState(value: unknown): value is LedgerState {
  return (
    isRecord(value) &&
    typeof value.ledgerName === "string" &&
    isSettings(value.settings) &&
    Array.isArray(value.bets) &&
    value.bets.every(isBet)
  );
}

function isLegacyTrackerState(value: unknown): value is {
  seriesName: string;
  settings: StrategySettings;
  bets: Bet[];
} {
  return (
    isRecord(value) &&
    typeof value.seriesName === "string" &&
    isSettings(value.settings) &&
    Array.isArray(value.bets) &&
    value.bets.every(isBet)
  );
}

function parseStoredValue(value: string | null, key: string): unknown | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    console.error(`Unable to read saved data from ${key}.`, error);
    return null;
  }
}

function loadLedger(): LoadedLedger {
  try {
    const currentStoredValue = window.localStorage.getItem(STORAGE_KEY);
    const legacyStoredValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!currentStoredValue && !legacyStoredValue) {
      return { state: createDemoLedger(), feedback: null };
    }

    const currentValue = parseStoredValue(currentStoredValue, STORAGE_KEY);
    if (isLedgerState(currentValue)) {
      return { state: currentValue, feedback: null };
    }

    const legacyValue = parseStoredValue(legacyStoredValue, LEGACY_STORAGE_KEY);
    if (isLegacyTrackerState(legacyValue)) {
      const migratedLedger: LedgerState = {
        ledgerName: legacyValue.seriesName,
        settings: legacyValue.settings,
        bets: legacyValue.bets,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedLedger));
      return {
        state: migratedLedger,
        feedback: {
          tone: "success",
          text: "Your existing data has been moved to FairBets sequences.",
        },
      };
    }

    return {
      state: createDemoLedger(),
      feedback: {
        tone: "warning",
        text: "Saved data could not be read. A FairBets demo is shown instead.",
      },
    };
  } catch (error) {
    console.error("Unable to load saved FairBets data.", error);
    return {
      state: createDemoLedger(),
      feedback: {
        tone: "warning",
        text: "This browser could not load saved data. A FairBets demo is shown instead.",
      },
    };
  }
}

function toDateTimeInput(date = new Date()): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function createBetDraft(): BetDraft {
  return {
    label: "",
    placedAt: toDateTimeInput(),
    odds: "1.30",
    outcome: "open",
    stakeOverride: "",
  };
}

function createBetId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `bet-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedMoney(value: number, currency: Currency): string {
  return value > 0
    ? `+${formatMoney(value, currency)}`
    : formatMoney(value, currency);
}

function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function currencyFromInput(value: string): Currency {
  if (value === "GBP" || value === "USD") {
    return value;
  }
  return "EUR";
}

function outcomeFromInput(value: string): Outcome {
  return isOutcome(value) ? value : "open";
}

function outcomeLabel(outcome: Outcome): string {
  if (outcome === "won") {
    return "Won";
  }
  if (outcome === "lost") {
    return "Lost";
  }
  return "Open";
}

function messageFromError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function linkedCloudLedgerId(userId: string): string | null {
  try {
    if (window.localStorage.getItem(CLOUD_LINK_USER_KEY) === userId) {
      return window.localStorage.getItem(CLOUD_LINK_LEDGER_KEY);
    }
    if (window.localStorage.getItem(LEGACY_CLOUD_LINK_USER_KEY) === userId) {
      return window.localStorage.getItem(LEGACY_CLOUD_LINK_SERIES_KEY);
    }
    return null;
  } catch (error) {
    console.error("Unable to read the cloud ledger link.", error);
    return null;
  }
}

function saveCloudLedgerLink(userId: string, ledgerId: string): void {
  try {
    window.localStorage.setItem(CLOUD_LINK_USER_KEY, userId);
    window.localStorage.setItem(CLOUD_LINK_LEDGER_KEY, ledgerId);
  } catch (error) {
    console.error("Unable to save the cloud ledger link.", error);
  }
}

function cloudStatusText(status: CloudStatus): string {
  switch (status) {
    case "checking":
      return "Checking your cloud session...";
    case "sending-link":
      return "Sending a sign-in link...";
    case "syncing":
      return "Syncing your FairBets ledger...";
    case "synced":
      return "Cloud copy is up to date.";
    case "error":
      return "Cloud sync needs attention.";
    case "ready":
      return "Cloud account connected.";
    case "signed-out":
      return "Sign in to save a private cloud copy.";
    case "unconfigured":
      return "Cloud sync has not been configured for this app.";
  }
}

function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </article>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function SequenceBetRow({
  bet,
  currency,
  onSettle,
  onEdit,
  onDelete,
}: {
  bet: CalculatedBet;
  currency: Currency;
  onSettle: (id: string, outcome: SettledOutcome) => void;
  onEdit: (bet: CalculatedBet) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className={`single-bet-card nested-sequence-bet nested-bet-${bet.outcome}`}>
      <div className="single-bet-state">
        <span>Bet {bet.sequencePosition}</span>
        <span className={`status-badge status-${bet.outcome}`}>{outcomeLabel(bet.outcome)}</span>
      </div>
      <div className="single-bet-info">
        <strong>{bet.label}</strong>
        <span>
          {formatDateTime(bet.placedAt)} | {formatOdds(bet.odds)} odds
        </span>
      </div>
      <div className="single-bet-metrics">
        <span>
          Stake <strong>{formatMoney(bet.stake, currency)}</strong>
        </span>
        <span>
          {bet.outcome === "open" ? "Potential" : "P&L"}{" "}
          <strong className={bet.profit < 0 ? "amount-negative" : "amount-positive"}>
            {bet.outcome === "open"
              ? formatMoney(bet.potentialProfit, currency)
              : formatSignedMoney(bet.profit, currency)}
          </strong>
        </span>
      </div>
      <div className="single-bet-actions">
        {bet.outcome === "open" ? (
          <>
            <button
              type="button"
              className="compact-outcome compact-won"
              onClick={() => onSettle(bet.id, "won")}
            >
              Won
            </button>
            <button
              type="button"
              className="compact-outcome compact-lost"
              onClick={() => onSettle(bet.id, "lost")}
            >
              Lost
            </button>
          </>
        ) : null}
        <button type="button" className="compact-action" onClick={() => onEdit(bet)}>
          Edit
        </button>
        <button type="button" className="compact-action compact-delete" onClick={() => onDelete(bet.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

function SingleBetSequenceCard({
  sequence,
  currency,
  onSettle,
  onEdit,
  onDelete,
}: {
  sequence: BetSequence;
  currency: Currency;
  onSettle: (id: string, outcome: SettledOutcome) => void;
  onEdit: (bet: CalculatedBet) => void;
  onDelete: (id: string) => void;
}) {
  const bet = sequence.bets[0];
  if (!bet) {
    return null;
  }

  return (
    <article className={`single-bet-card single-bet-${sequence.status}`}>
      <div className="single-bet-state">
        <span>Bet {sequence.number}</span>
        <span className={`status-badge status-${sequence.status}`}>
          {sequence.status === "closed" ? "Closed" : "Active"}
        </span>
      </div>
      <div className="single-bet-info">
        <strong>{bet.label}</strong>
        <span>
          {formatDateTime(bet.placedAt)} | {formatOdds(bet.odds)} odds
        </span>
      </div>
      <div className="single-bet-metrics">
        <span>
          Stake <strong>{formatMoney(bet.stake, currency)}</strong>
        </span>
        <span>
          {bet.outcome === "open" ? "Potential" : "P&L"}{" "}
          <strong className={bet.profit < 0 ? "amount-negative" : "amount-positive"}>
            {bet.outcome === "open"
              ? formatMoney(bet.potentialProfit, currency)
              : formatSignedMoney(bet.profit, currency)}
          </strong>
        </span>
      </div>
      <div className="single-bet-actions">
        {bet.outcome === "open" ? (
          <>
            <button
              type="button"
              className="compact-outcome compact-won"
              onClick={() => onSettle(bet.id, "won")}
            >
              Won
            </button>
            <button
              type="button"
              className="compact-outcome compact-lost"
              onClick={() => onSettle(bet.id, "lost")}
            >
              Lost
            </button>
          </>
        ) : null}
        <button type="button" className="compact-action" onClick={() => onEdit(bet)}>
          Edit
        </button>
        <button type="button" className="compact-action compact-delete" onClick={() => onDelete(bet.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

function MultiBetSequenceCard({
  sequence,
  currency,
  onSettle,
  onEdit,
  onDelete,
}: {
  sequence: BetSequence;
  currency: Currency;
  onSettle: (id: string, outcome: SettledOutcome) => void;
  onEdit: (bet: CalculatedBet) => void;
  onDelete: (id: string) => void;
}) {
  const sequenceStatusLabel = sequence.status === "closed" ? "Closed" : "Active";
  const dateRange = sequence.endedAt
    ? `${formatDateTime(sequence.startedAt)} to ${formatDateTime(sequence.endedAt)}`
    : `Started ${formatDateTime(sequence.startedAt)}`;

  return (
    <details className={`compact-sequence-card compact-sequence-${sequence.status}`}>
      <summary>
        <span className="compact-sequence-state">
          <strong>Sequence {sequence.number}</strong>
          <span className={`status-badge status-${sequence.status}`}>{sequenceStatusLabel}</span>
        </span>
        <span className="compact-sequence-info">
          <strong>{sequence.bets.length} bets</strong>
          <span>{dateRange}</span>
        </span>
        <span className="compact-sequence-metric compact-sequence-stake">
          Stake <strong>{formatMoney(sequence.totalStaked, currency)}</strong>
        </span>
        <span className="compact-sequence-metric compact-sequence-pnl">
          P&L{" "}
          <strong className={sequence.profit < 0 ? "amount-negative" : "amount-positive"}>
            {formatSignedMoney(sequence.profit, currency)}
          </strong>
        </span>
        <span className="compact-sequence-toggle">View bets</span>
      </summary>
      <div className="compact-sequence-details">
        <div className="sequence-bet-list">
          {sequence.bets.map((bet) => (
            <SequenceBetRow
              key={bet.id}
              bet={bet}
              currency={currency}
              onSettle={onSettle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </details>
  );
}

function ActiveSequenceCard({
  sequence,
  currency,
  onSettle,
  onEdit,
  onDelete,
}: {
  sequence: BetSequence;
  currency: Currency;
  onSettle: (id: string, outcome: SettledOutcome) => void;
  onEdit: (bet: CalculatedBet) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="sequence-card sequence-active">
      <div className="sequence-card-heading">
        <div>
          <p className="sequence-number">Sequence {sequence.number}</p>
          <h3>In progress</h3>
          <span>Started {formatDateTime(sequence.startedAt)}</span>
        </div>
        <span className="status-badge status-active">Active</span>
      </div>
      <div className="sequence-stats">
        <div>
          <span>Bets</span>
          <strong>{sequence.bets.length}</strong>
        </div>
        <div>
          <span>Stake</span>
          <strong>{formatMoney(sequence.totalStaked, currency)}</strong>
        </div>
        <div>
          <span>Sequence P&L</span>
          <strong className={sequence.profit < 0 ? "amount-negative" : "amount-positive"}>
            {formatSignedMoney(sequence.profit, currency)}
          </strong>
        </div>
        <div>
          <span>Open exposure</span>
          <strong>{formatMoney(sequence.openExposure, currency)}</strong>
        </div>
      </div>
      <div className="sequence-bet-list active-sequence-bet-list">
        {sequence.bets.map((bet) => (
          <SequenceBetRow
            key={bet.id}
            bet={bet}
            currency={currency}
            onSettle={onSettle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <p className="sequence-footnote">
        This sequence remains active until one of its bets is marked as won.
      </p>
    </article>
  );
}

function App() {
  const [loadedLedger] = useState<LoadedLedger>(loadLedger);
  const [tracker, setTracker] = useState<LedgerState>(loadedLedger.state);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBetId, setEditingBetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BetDraft>(createBetDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(loadedLedger.feedback);
  const [isImporting, setIsImporting] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<StrategySettings>(tracker.settings);
  const [ledgerNameDraft, setLedgerNameDraft] = useState(tracker.ledgerName);
  const [cloudSession, setCloudSession] = useState<Session | null>(null);
  const [cloudLedgerId, setCloudLedgerId] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(
    isSupabaseConfigured ? "checking" : "unconfigured",
  );
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudEmail, setCloudEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloudSessionRef = useRef<Session | null>(null);
  const cloudLedgerIdRef = useRef<string | null>(null);
  const queuedCloudTrackerRef = useRef<LedgerState | null>(null);
  const cloudSaveTimerRef = useRef<number | null>(null);
  const cloudSaveInFlightRef = useRef(false);

  const calculation = useMemo(
    () => calculateLedger(tracker.bets, tracker.settings),
    [tracker.bets, tracker.settings],
  );
  const draftOdds = Number(draft.odds);
  const draftSuggestion = useMemo(
    () => suggestStakeForOdds(calculation.recoveryGap, draftOdds, tracker.settings),
    [calculation.recoveryGap, draftOdds, tracker.settings],
  );
  const editingBet = editingBetId
    ? tracker.bets.find((bet) => bet.id === editingBetId) ?? null
    : null;
  const isEditingSettledBet = editingBet !== null && editingBet.outcome !== "open";
  const historySequences = useMemo(() => {
    const matchingSequences = calculation.sequences.filter((sequence) => {
      if (historyFilter === "active") {
        return sequence.status === "active";
      }
      if (historyFilter === "closed") {
        return sequence.status === "closed";
      }
      return true;
    });

    return [...matchingSequences].reverse();
  }, [calculation.sequences, historyFilter]);
  const recentBets = calculation.bets.slice(-5).reverse();
  const goalProgress = Math.max(0, Math.min(calculation.goalProgress, 1));

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let active = true;
    const applyCloudSession = (session: Session | null) => {
      if (!active) {
        return;
      }

      cloudSessionRef.current = session;
      setCloudSession(session);
      setCloudError(null);

      if (session) {
        const storedLedgerId = linkedCloudLedgerId(session.user.id);
        cloudLedgerIdRef.current = storedLedgerId;
        setCloudLedgerId(storedLedgerId);
        setCloudStatus("ready");
      } else {
        cloudLedgerIdRef.current = null;
        setCloudLedgerId(null);
        setCloudStatus("signed-out");
      }
    };

    void getCloudSession()
      .then(applyCloudSession)
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        console.error("Cloud session initialization failed.", error);
        setCloudError(messageFromError(error, "Cloud session could not be initialized."));
        setCloudStatus("error");
      });

    const unsubscribe = subscribeToCloudAuthChanges(applyCloudSession);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(
    () => () => {
      if (cloudSaveTimerRef.current !== null) {
        window.clearTimeout(cloudSaveTimerRef.current);
      }
    },
    [],
  );

  function linkCloudLedger(ledgerId: string) {
    cloudLedgerIdRef.current = ledgerId;
    setCloudLedgerId(ledgerId);
    const user = cloudSessionRef.current?.user;
    if (user) {
      saveCloudLedgerLink(user.id, ledgerId);
    }
  }

  function queueCloudSync(nextTracker: LedgerState) {
    if (!cloudSessionRef.current || !cloudLedgerIdRef.current) {
      return;
    }

    queuedCloudTrackerRef.current = nextTracker;
    if (cloudSaveTimerRef.current !== null) {
      window.clearTimeout(cloudSaveTimerRef.current);
    }
    cloudSaveTimerRef.current = window.setTimeout(() => {
      cloudSaveTimerRef.current = null;
      void flushQueuedCloudSync();
    }, 700);
  }

  async function flushQueuedCloudSync() {
    if (cloudSaveInFlightRef.current) {
      return;
    }

    const trackerToSync = queuedCloudTrackerRef.current;
    const currentLedgerId = cloudLedgerIdRef.current;
    if (!trackerToSync || !cloudSessionRef.current || !currentLedgerId) {
      return;
    }

    queuedCloudTrackerRef.current = null;
    cloudSaveInFlightRef.current = true;
    setCloudStatus("syncing");
    setCloudError(null);

    try {
      const savedLedgerId = await saveLedgerToCloud(trackerToSync, currentLedgerId);
      linkCloudLedger(savedLedgerId);
      setCloudStatus("synced");
    } catch (error) {
      console.error("Automatic cloud sync failed.", error);
      queuedCloudTrackerRef.current = null;
      setCloudError(messageFromError(error, "The latest changes could not be synced."));
      setCloudStatus("error");
    } finally {
      cloudSaveInFlightRef.current = false;
      if (queuedCloudTrackerRef.current) {
        void flushQueuedCloudSync();
      }
    }
  }

  async function syncCurrentLedger() {
    if (!cloudSessionRef.current) {
      setFeedback({ tone: "warning", text: "Sign in before backing up to the cloud." });
      return;
    }
    if (cloudSaveInFlightRef.current) {
      setFeedback({ tone: "warning", text: "A cloud sync is already in progress." });
      return;
    }

    if (cloudSaveTimerRef.current !== null) {
      window.clearTimeout(cloudSaveTimerRef.current);
      cloudSaveTimerRef.current = null;
    }
    queuedCloudTrackerRef.current = null;
    cloudSaveInFlightRef.current = true;
    setCloudStatus("syncing");
    setCloudError(null);

    try {
      const savedLedgerId = await saveLedgerToCloud(tracker, cloudLedgerIdRef.current);
      linkCloudLedger(savedLedgerId);
      setCloudStatus("synced");
      setFeedback({
        tone: "success",
        text: "The current FairBets ledger is now backed up to your cloud account.",
      });
    } catch (error) {
      console.error("Manual cloud sync failed.", error);
      const message = messageFromError(error, "The current FairBets ledger could not be backed up.");
      setCloudError(message);
      setCloudStatus("error");
      setFeedback({ tone: "error", text: message });
    } finally {
      cloudSaveInFlightRef.current = false;
    }
  }

  async function restoreCloudLedger() {
    if (!cloudSessionRef.current) {
      setFeedback({ tone: "warning", text: "Sign in before restoring a cloud ledger." });
      return;
    }
    if (
      !window.confirm(
        "Replace the current local ledger with the latest ledger saved in your cloud account?",
      )
    ) {
      return;
    }

    setCloudStatus("syncing");
    setCloudError(null);
    try {
      const cloudLedger = await loadLatestCloudLedger();
      if (!cloudLedger) {
        setCloudStatus("ready");
        setFeedback({ tone: "warning", text: "No saved ledger was found in this cloud account." });
        return;
      }

      const savedLocally = commitTracker(cloudLedger.ledger, false);
      linkCloudLedger(cloudLedger.ledgerId);
      setSettingsDraft(cloudLedger.ledger.settings);
      setLedgerNameDraft(cloudLedger.ledger.ledgerName);
      setCloudStatus("synced");
      if (savedLocally) {
        setFeedback({
          tone: "success",
          text: "The latest cloud ledger replaced the current local copy.",
        });
      }
    } catch (error) {
      console.error("Cloud restore failed.", error);
      const message = messageFromError(error, "The cloud ledger could not be restored.");
      setCloudError(message);
      setCloudStatus("error");
      setFeedback({ tone: "error", text: message });
    }
  }

  async function requestCloudSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = cloudEmail.trim();
    if (!email || !email.includes("@")) {
      setCloudError("Enter a valid email address.");
      return;
    }

    setCloudStatus("sending-link");
    setCloudError(null);
    try {
      await sendMagicLink(email);
      setCloudStatus("signed-out");
      setFeedback({
        tone: "success",
        text: "Check your email for the secure sign-in link.",
      });
    } catch (error) {
      console.error("Magic link request failed.", error);
      const message = messageFromError(error, "The sign-in link could not be sent.");
      setCloudError(message);
      setCloudStatus("error");
    }
  }

  async function disconnectCloud() {
    try {
      await signOutFromCloud();
      cloudSessionRef.current = null;
      cloudLedgerIdRef.current = null;
      setCloudSession(null);
      setCloudLedgerId(null);
      setCloudError(null);
      setCloudStatus("signed-out");
      setFeedback({ tone: "success", text: "Signed out of cloud sync." });
    } catch (error) {
      console.error("Cloud sign-out failed.", error);
      const message = messageFromError(error, "Cloud sign-out failed.");
      setCloudError(message);
      setCloudStatus("error");
    }
  }

  function commitTracker(nextTracker: LedgerState, syncCloud = true): boolean {
    setTracker(nextTracker);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTracker));
      if (syncCloud) {
        queueCloudSync(nextTracker);
      }
      return true;
    } catch (error) {
      console.error("Unable to save tracker data.", error);
      setFeedback({
        tone: "error",
        text: "Changes are visible but could not be saved in this browser.",
      });
      return false;
    }
  }

  function replaceTracker(nextTracker: LedgerState, nextFeedback: Feedback) {
    const saved = commitTracker(nextTracker);
    setSettingsDraft(nextTracker.settings);
    setLedgerNameDraft(nextTracker.ledgerName);
    if (saved) {
      setFeedback(nextFeedback);
    }
  }

  function openNewBetForm() {
    setEditingBetId(null);
    setDraft(createBetDraft());
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditBetForm(bet: CalculatedBet) {
    setEditingBetId(bet.id);
    setDraft({
      label: bet.label,
      placedAt: bet.placedAt.slice(0, 16),
      odds: String(bet.odds),
      outcome: bet.outcome,
      stakeOverride: bet.stakeOverride === undefined ? "" : String(bet.stakeOverride),
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeBetForm() {
    setIsFormOpen(false);
    setEditingBetId(null);
    setFormError(null);
  }

  function saveBet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const odds = Number(draft.odds);
    const manualStake = draft.stakeOverride.trim()
      ? Number(draft.stakeOverride)
      : undefined;

    if (!draft.placedAt) {
      setFormError("Choose when the bet was placed.");
      return;
    }
    if (!Number.isFinite(odds) || odds <= 1) {
      setFormError("Odds must be a number greater than 1.00.");
      return;
    }
    if (isEditingSettledBet && draft.outcome === "open") {
      setFormError("A settled bet cannot be changed back to Open.");
      return;
    }
    if (
      manualStake !== undefined &&
      (!Number.isFinite(manualStake) ||
        manualStake <= 0 ||
        manualStake > tracker.settings.maxStake)
    ) {
      setFormError(
        `Manual stake must be above zero and no more than ${formatMoney(
          tracker.settings.maxStake,
          tracker.settings.currency,
        )}.`,
      );
      return;
    }

    const bet: Bet = {
      id: editingBetId ?? createBetId(),
      label: draft.label.trim() || `Selection ${tracker.bets.length + 1}`,
      placedAt: draft.placedAt,
      odds,
      outcome: draft.outcome,
      ...(manualStake === undefined ? {} : { stakeOverride: manualStake }),
    };

    const saved = commitTracker({
      ...tracker,
      bets: editingBetId
        ? tracker.bets.map((currentBet) =>
            currentBet.id === editingBetId ? bet : currentBet,
          )
        : [...tracker.bets, bet],
    });
    if (saved) {
      setFeedback({
        tone: "success",
        text: editingBetId
          ? "Bet updated and sequences recalculated."
          : "Bet recorded and sequences recalculated.",
      });
    }
    closeBetForm();
    setActiveTab("history");
  }

  function settleBet(id: string, outcome: SettledOutcome) {
    const currentBet = tracker.bets.find((bet) => bet.id === id);
    if (!currentBet || currentBet.outcome !== "open") {
      setFeedback({
        tone: "warning",
        text: "Only an open bet can be settled.",
      });
      return;
    }

    const saved = commitTracker({
      ...tracker,
      bets: tracker.bets.map((bet) => (bet.id === id ? { ...bet, outcome } : bet)),
    });
    if (saved) {
      setFeedback({
        tone: "success",
        text: `Bet marked as ${outcome}.`,
      });
    }
  }

  function deleteBet(id: string) {
    const bet = tracker.bets.find((item) => item.id === id);
    if (!bet || !window.confirm(`Delete "${bet.label}" from this ledger?`)) {
      return;
    }

    const saved = commitTracker({
      ...tracker,
      bets: tracker.bets.filter((item) => item.id !== id),
    });
    if (saved) {
      setFeedback({ tone: "success", text: "Bet removed and sequences recalculated." });
    }
  }

  async function handleWorkbookImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    try {
      const imported = await importWorkbook(file);
      replaceTracker({
        ledgerName: imported.ledgerName,
        settings: imported.settings,
        bets: imported.bets,
      }, {
        tone: "success",
        text: `${imported.bets.length} bets imported from ${file.name}.`,
      });
      setActiveTab("overview");
    } catch (error) {
      console.error("Workbook import failed.", error);
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "The workbook could not be imported.",
      });
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  }

  function updateNumericSetting(key: NumericSetting, value: string) {
    setSettingsDraft((current) => ({ ...current, [key]: Number(value) }));
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericValues = [
      settingsDraft.startingBalance,
      settingsDraft.baseStake,
      settingsDraft.threshold,
      settingsDraft.recoveryWeight,
      settingsDraft.maxStake,
      settingsDraft.maxOpenExposure,
    ];

    if (ledgerNameDraft.trim().length === 0) {
      setFeedback({ tone: "error", text: "Give this FairBets ledger a name before saving." });
      return;
    }
    if (numericValues.some((value) => !Number.isFinite(value) || value <= 0)) {
      setFeedback({ tone: "error", text: "Settings must contain positive numbers." });
      return;
    }
    if (!Number.isFinite(settingsDraft.goalRate) || settingsDraft.goalRate <= 0 || settingsDraft.goalRate > 1) {
      setFeedback({ tone: "error", text: "Goal rate must be between 1% and 100%." });
      return;
    }
    if (
      !Number.isInteger(settingsDraft.stakeRounding) ||
      settingsDraft.stakeRounding < 0 ||
      settingsDraft.stakeRounding > 4
    ) {
      setFeedback({ tone: "error", text: "Stake rounding must be a whole number from 0 to 4." });
      return;
    }
    if (settingsDraft.maxStake < settingsDraft.baseStake) {
      setFeedback({ tone: "error", text: "The maximum stake cannot be below the base stake." });
      return;
    }

    const saved = commitTracker({
      ...tracker,
      ledgerName: ledgerNameDraft.trim(),
      settings: { ...settingsDraft },
    });
    if (saved) {
      setFeedback({ tone: "success", text: "Strategy settings saved and all sequences recalculated." });
    }
  }

  function loadDemoData() {
    if (!window.confirm("Replace the current FairBets ledger with the included demo data?")) {
      return;
    }
    replaceTracker(createDemoLedger(), { tone: "success", text: "FairBets demo loaded." });
    setActiveTab("overview");
  }

  function startFresh() {
    if (!window.confirm("Remove all bets and start a new empty FairBets ledger?")) {
      return;
    }
    replaceTracker(createBlankLedger(), {
      tone: "success",
      text: "A new empty FairBets ledger is ready.",
    });
    setActiveTab("overview");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand"
          onClick={() => setActiveTab("overview")}
          aria-label="Go to overview"
        >
          <span className="brand-mark">FB</span>
          <span>
            <strong>FairBets</strong>
            <small>Sequence tracking</small>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Main navigation">
          {(["overview", "history", "settings"] as Tab[]).map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "overview" ? "Overview" : tab === "history" ? "Sequences" : "Settings"}
            </button>
          ))}
        </nav>

        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleWorkbookImport}
        />
      </header>

      <main className="main-content">
        {feedback && (
          <div className={`notice notice-${feedback.tone}`} role="status">
            <span>{feedback.text}</span>
            <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">
              Dismiss
            </button>
          </div>
        )}

        {activeTab === "overview" && (
          <>
            <section className="hero-panel">
              <div className="hero-copy">
                <p className="eyebrow">Current ledger</p>
                <h1>{tracker.ledgerName}</h1>
                <p className="hero-description">
                  Track decisions, exposure, and outcomes in one private ledger. Suggestions
                  are based on your settings, not predictions.
                </p>
                <div className="hero-meta">
                  <span>{calculation.sequences.length} sequences</span>
                  <span>{formatPercent(calculation.winRate)} settled win rate</span>
                  <span>
                    {calculation.activeSequence
                      ? `Sequence ${calculation.activeSequence.number} active`
                      : "Ready for a new sequence"}
                  </span>
                </div>
              </div>
              <div className="next-stake-card">
                <p>Next bet guide</p>
                <strong>{formatMoney(calculation.nextSuggestion.amount, tracker.settings.currency)}</strong>
                <span>At {formatOdds(calculation.nextOddsGuide)} odds</span>
                <div className="stake-breakdown">
                  <span>Base {formatMoney(calculation.nextSuggestion.baseStake, tracker.settings.currency)}</span>
                  <span>
                    Recovery {formatMoney(calculation.nextSuggestion.recoveryOffset, tracker.settings.currency)}
                  </span>
                </div>
                {calculation.nextSuggestion.capped && (
                  <p className="cap-note">Capped at your safety limit.</p>
                )}
              </div>
            </section>

            <section className="metrics-grid" aria-label="FairBets summary">
              <MetricCard
                label="Available balance"
                value={formatMoney(calculation.availableBalance, tracker.settings.currency)}
                hint={`${formatMoney(calculation.openExposure, tracker.settings.currency)} committed to open bets`}
                tone="accent"
              />
              <MetricCard
                label="Settled P&L"
                value={formatSignedMoney(calculation.settledProfit, tracker.settings.currency)}
                hint={`${calculation.wins} won and ${calculation.losses} lost`}
                tone={calculation.settledProfit >= 0 ? "positive" : "negative"}
              />
              <MetricCard
                label="Active sequence"
                value={
                  calculation.activeSequence
                    ? `#${calculation.activeSequence.number}`
                    : "Ready"
                }
                hint={
                  calculation.activeSequence
                    ? `${calculation.activeSequence.bets.length} bets, ${formatMoney(
                        calculation.recoveryGap,
                        tracker.settings.currency,
                      )} recovery gap`
                    : "The next bet begins a new sequence"
                }
              />
              <MetricCard
                label="Largest stake"
                value={formatMoney(calculation.largestStake, tracker.settings.currency)}
                hint={`Safety limit ${formatMoney(tracker.settings.maxStake, tracker.settings.currency)}`}
                tone={calculation.largestStake >= tracker.settings.maxStake ? "negative" : "neutral"}
              />
            </section>

            <section className="content-grid">
              <article className="panel goal-panel">
                <SectionTitle eyebrow="Goal tracking" title="Settled progress" />
                <div className="goal-values">
                  <div>
                    <strong>{formatSignedMoney(calculation.settledProfit, tracker.settings.currency)}</strong>
                    <span>settled result</span>
                  </div>
                  <div>
                    <strong>{formatMoney(calculation.goal, tracker.settings.currency)}</strong>
                    <span>{formatPercent(tracker.settings.goalRate)} of expected profit</span>
                  </div>
                </div>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(goalProgress * 100)}
                  aria-label="Goal progress"
                >
                  <span style={{ width: `${goalProgress * 100}%` }} />
                </div>
                <p className="panel-footnote">
                  {formatPercent(goalProgress)} of the current calculated goal.
                </p>
              </article>

              <article
                className={`panel risk-panel ${calculation.riskFlags.length ? "risk-warning" : "risk-safe"}`}
              >
                <SectionTitle
                  eyebrow="Guardrails"
                  title={calculation.riskFlags.length ? "Attention needed" : "Within your limits"}
                />
                {calculation.riskFlags.length ? (
                  <ul className="risk-list">
                    {calculation.riskFlags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Open exposure is below your limit of{" "}
                    {formatMoney(tracker.settings.maxOpenExposure, tracker.settings.currency)}.
                  </p>
                )}
                <button type="button" className="text-button" onClick={() => setActiveTab("settings")}>
                  Review guardrails
                </button>
              </article>
            </section>

            <section className="panel recent-panel">
              <SectionTitle
                eyebrow="Latest activity"
                title="Recent bets"
                action={
                  <button type="button" className="text-button" onClick={() => setActiveTab("history")}>
                    View sequences
                  </button>
                }
              />
              {recentBets.length ? (
                <div className="recent-list">
                  {recentBets.map((bet) => (
                    <div className="recent-row" key={bet.id}>
                      <div>
                        <strong>{bet.label}</strong>
                        <span>
                          {formatDateTime(bet.placedAt)} | {formatOdds(bet.odds)} odds
                        </span>
                      </div>
                      <span className={`status-badge status-${bet.outcome}`}>
                        {outcomeLabel(bet.outcome)}
                      </span>
                      <strong className={bet.profit < 0 ? "amount-negative" : "amount-positive"}>
                        {bet.outcome === "open"
                          ? formatMoney(bet.stake, tracker.settings.currency)
                          : formatSignedMoney(bet.profit, tracker.settings.currency)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <strong>No bets recorded yet.</strong>
                  <p>Add a bet to calculate the first suggested stake.</p>
                  <button type="button" className="button button-primary" onClick={openNewBetForm}>
                    Add the first bet
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "history" && (
          <section className="sequence-page">
            <SectionTitle
              eyebrow="Sequences"
              title={`${calculation.sequences.length} sequences`}
              action={
                <button type="button" className="button button-primary" onClick={openNewBetForm}>
                  <span aria-hidden="true">+</span> Add bet
                </button>
              }
            />

            <div className="filter-bar" aria-label="Sequence filter">
              {(["all", "active", "closed"] as HistoryFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={historyFilter === filter ? "active" : ""}
                  onClick={() => setHistoryFilter(filter)}
                >
                  {filter === "all"
                    ? "All sequences"
                    : filter === "active"
                      ? "Active"
                      : "Closed"}
                </button>
              ))}
            </div>

            {historySequences.length ? (
              <div className="sequence-list">
                {historySequences.map((sequence) => {
                  if (sequence.bets.length === 1) {
                    return (
                      <SingleBetSequenceCard
                        key={sequence.id}
                        sequence={sequence}
                        currency={tracker.settings.currency}
                        onSettle={settleBet}
                        onEdit={openEditBetForm}
                        onDelete={deleteBet}
                      />
                    );
                  }

                  if (sequence.status === "active") {
                    return (
                      <ActiveSequenceCard
                        key={sequence.id}
                        sequence={sequence}
                        currency={tracker.settings.currency}
                        onSettle={settleBet}
                        onEdit={openEditBetForm}
                        onDelete={deleteBet}
                      />
                    );
                  }

                  return (
                    <MultiBetSequenceCard
                      key={sequence.id}
                      sequence={sequence}
                      currency={tracker.settings.currency}
                      onSettle={settleBet}
                      onEdit={openEditBetForm}
                      onDelete={deleteBet}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state history-empty">
                <strong>No sequences match this filter.</strong>
                <p>Use a different filter or add a new bet.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === "settings" && (
          <section className="settings-page">
            <SectionTitle eyebrow="FairBets controls" title="Strategy and safety settings" />
            <div className="settings-layout">
              <form className="panel settings-form" onSubmit={saveSettings}>
                <div className="form-section">
                  <h3>Ledger basics</h3>
                  <div className="form-grid">
                    <label className="form-field form-field-wide">
                      <span>Ledger name</span>
                      <input
                        value={ledgerNameDraft}
                        onChange={(event) => setLedgerNameDraft(event.target.value)}
                        maxLength={60}
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Starting balance</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={settingsDraft.startingBalance}
                        onChange={(event) => updateNumericSetting("startingBalance", event.target.value)}
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Currency</span>
                      <select
                        value={settingsDraft.currency}
                        onChange={(event) =>
                          setSettingsDraft((current) => ({
                            ...current,
                            currency: currencyFromInput(event.target.value),
                          }))
                        }
                      >
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Calculation rules</h3>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>Base stake</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={settingsDraft.baseStake}
                        onChange={(event) => updateNumericSetting("baseStake", event.target.value)}
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Goal rate (%)</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={Math.round(settingsDraft.goalRate * 100)}
                        onChange={(event) =>
                          updateNumericSetting("goalRate", String(Number(event.target.value) / 100))
                        }
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Recovery threshold</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={settingsDraft.threshold}
                        onChange={(event) => updateNumericSetting("threshold", event.target.value)}
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Recovery weight (%)</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={Math.round(settingsDraft.recoveryWeight * 100)}
                        onChange={(event) =>
                          updateNumericSetting(
                            "recoveryWeight",
                            String(Number(event.target.value) / 100),
                          )
                        }
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Stake rounding (decimals)</span>
                      <input
                        type="number"
                        min="0"
                        max="4"
                        step="1"
                        value={settingsDraft.stakeRounding}
                        onChange={(event) => updateNumericSetting("stakeRounding", event.target.value)}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Safety limits</h3>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>Maximum stake</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={settingsDraft.maxStake}
                        onChange={(event) => updateNumericSetting("maxStake", event.target.value)}
                        required
                      />
                    </label>
                    <label className="form-field">
                      <span>Maximum open exposure</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={settingsDraft.maxOpenExposure}
                        onChange={(event) =>
                          updateNumericSetting("maxOpenExposure", event.target.value)
                        }
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="settings-actions">
                  <button type="submit" className="button button-primary">
                    Save settings
                  </button>
                  <span>Saving recalculates every sequence.</span>
                </div>
              </form>

              <aside className="settings-aside">
                <article className="panel strategy-note">
                  <p className="eyebrow">How the ledger works</p>
                  <h3>Clear inputs, transparent outputs</h3>
                  <ol>
                    <li>Each settled bet adds its base-stake expectation.</li>
                    <li>Actual wins and losses form settled P&L.</li>
                    <li>The difference becomes the recovery gap.</li>
                    <li>The next stake uses that gap and your guardrails.</li>
                  </ol>
                  <p>This tracker records a strategy. It does not predict results or place bets.</p>
                </article>

                <article className="panel data-tools">
                  <p className="eyebrow">Local data</p>
                  <h3>Import and manage records</h3>
                  <p>
                    Data stays in this browser unless you choose to back it up to a connected
                    cloud account.
                  </p>
                  <button
                    type="button"
                    className="button button-quiet"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    Import .xlsx
                  </button>
                  <div className="data-tool-actions">
                    <button type="button" className="text-button" onClick={loadDemoData}>
                      Load demo data
                    </button>
                    <button type="button" className="text-button text-button-danger" onClick={startFresh}>
                      Start fresh
                    </button>
                  </div>
                </article>

                <article className="panel cloud-tools">
                  <p className="eyebrow">Cloud backup</p>
                  <h3>Supabase PostgreSQL</h3>
                  {!isSupabaseConfigured ? (
                    <>
                      <p>
                        This deployment is running in local-only mode. Add the Supabase
                        environment settings to enable private, cross-device backup.
                      </p>
                      {supabaseConfigurationError && (
                        <p className="cloud-error">{supabaseConfigurationError}</p>
                      )}
                      <p className="cloud-footnote">
                        Setup instructions and the database schema are included in the project.
                      </p>
                    </>
                  ) : cloudSession ? (
                    <>
                      <p>
                        Connected as <strong>{cloudSession.user.email ?? "your account"}</strong>.
                      </p>
                      <p className={`cloud-status cloud-status-${cloudStatus}`}>
                        {cloudStatusText(cloudStatus)}
                      </p>
                      {cloudError && <p className="cloud-error">{cloudError}</p>}
                      <div className="cloud-actions">
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => void syncCurrentLedger()}
                          disabled={cloudStatus === "syncing"}
                        >
                          {cloudLedgerId ? "Sync current ledger" : "Back up current ledger"}
                        </button>
                        <button
                          type="button"
                          className="button button-quiet"
                          onClick={() => void restoreCloudLedger()}
                          disabled={cloudStatus === "syncing"}
                        >
                          Restore cloud ledger
                        </button>
                      </div>
                      <p className="cloud-footnote">
                        {cloudLedgerId
                          ? "Changes sync automatically after this device has been linked."
                          : "Back up or restore once to link this device to your cloud ledger."}
                      </p>
                      <button type="button" className="text-button" onClick={() => void disconnectCloud()}>
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <p>{cloudStatusText(cloudStatus)}</p>
                      <form className="cloud-form" onSubmit={requestCloudSignIn}>
                        <label className="form-field">
                          <span>Email address</span>
                          <input
                            type="email"
                            value={cloudEmail}
                            onChange={(event) => setCloudEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                          />
                        </label>
                        <button
                          type="submit"
                          className="button button-primary"
                          disabled={cloudStatus === "checking" || cloudStatus === "sending-link"}
                        >
                          Send sign-in link
                        </button>
                      </form>
                      {cloudError && <p className="cloud-error">{cloudError}</p>}
                    </>
                  )}
                </article>
              </aside>
            </div>
          </section>
        )}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {(["overview", "history", "settings"] as Tab[]).map((tab) => (
          <button
            type="button"
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            <span>{tab === "overview" ? "Home" : tab === "history" ? "Sequences" : "Settings"}</span>
          </button>
        ))}
      </nav>

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="bet-modal" role="dialog" aria-modal="true" aria-labelledby="bet-form-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editingBetId ? "Edit record" : "New record"}</p>
                <h2 id="bet-form-title">{editingBetId ? "Update bet" : "Add a bet"}</h2>
              </div>
              <button type="button" className="close-button" onClick={closeBetForm}>
                Close
              </button>
            </div>

            <form onSubmit={saveBet}>
              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>Label</span>
                  <input
                    value={draft.label}
                    onChange={(event) => setDraft((current) => ({ ...current, label: event.target.value }))}
                    maxLength={60}
                    placeholder="e.g. Selection 09"
                  />
                </label>
                <label className="form-field">
                  <span>Date and time</span>
                  <input
                    type="datetime-local"
                    value={draft.placedAt}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, placedAt: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Decimal odds</span>
                  <input
                    type="number"
                    min="1.01"
                    step="0.01"
                    value={draft.odds}
                    onChange={(event) => setDraft((current) => ({ ...current, odds: event.target.value }))}
                    required
                  />
                </label>
                <label className="form-field">
                  <span>{isEditingSettledBet ? "Result (settled)" : "Result"}</span>
                  <select
                    value={draft.outcome}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        outcome: outcomeFromInput(event.target.value),
                      }))
                    }
                  >
                    {!isEditingSettledBet && <option value="open">Open</option>}
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Manual stake (optional)</span>
                  <input
                    type="number"
                    min="0.01"
                    max={tracker.settings.maxStake}
                    step="0.01"
                    value={draft.stakeOverride}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, stakeOverride: event.target.value }))
                    }
                    placeholder={formatMoney(draftSuggestion.amount, tracker.settings.currency)}
                  />
                </label>
              </div>

              <div className="suggestion-preview">
                <div>
                  <span>Suggested stake</span>
                  <strong>{formatMoney(draftSuggestion.amount, tracker.settings.currency)}</strong>
                </div>
                <div>
                  <span>Recovery offset</span>
                  <strong>{formatMoney(draftSuggestion.recoveryOffset, tracker.settings.currency)}</strong>
                </div>
                <p>
                  This bet is assigned automatically to{" "}
                  {calculation.activeSequence
                    ? `sequence ${calculation.activeSequence.number}`
                    : "a new sequence"}
                  . A win closes that sequence.
                </p>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="button button-quiet" onClick={closeBetForm}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  {editingBetId ? "Save changes" : "Add bet"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
