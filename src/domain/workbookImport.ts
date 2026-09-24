import { readSheet } from "read-excel-file/browser";
import type { Bet, Outcome, StrategySettings, UnstampedBet } from "./ledger";
import { defaultSettings, stampBets } from "./ledger";

type SpreadsheetCell = string | number | boolean | Date | null;
type SpreadsheetRows = SpreadsheetCell[][];

export interface ImportedWorkbook {
  ledgerName: string;
  settings: StrategySettings;
  bets: Bet[];
}

function toText(value: SpreadsheetCell | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: SpreadsheetCell | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function firstPositive(value: number | undefined, fallback: number): number {
  return value !== undefined && value > 0 ? value : fallback;
}

function localDateTime(year: number, month: number, day: number, hour = 0, minute = 0): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

function dateFromCell(value: SpreadsheetCell | undefined, time: SpreadsheetCell | undefined): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return localDateTime(
      value.getUTCFullYear(),
      value.getUTCMonth() + 1,
      value.getUTCDate(),
      value.getUTCHours(),
      value.getUTCMinutes(),
    );
  }

  const serial = toNumber(value);
  if (serial !== undefined) {
    const timeFraction =
      typeof time === "number" && time >= 0 && time < 1
        ? time
        : time instanceof Date
          ? (time.getUTCHours() * 60 + time.getUTCMinutes()) / (24 * 60)
          : 0;
    const date = new Date(
      Date.UTC(1899, 11, 30) + Math.round((serial + timeFraction) * 86_400_000),
    );
    return localDateTime(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
    );
  }

  const text = toText(value);
  const parsed = new Date(text);
  if (text && !Number.isNaN(parsed.getTime())) {
    return localDateTime(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth() + 1,
      parsed.getUTCDate(),
      parsed.getUTCHours(),
      parsed.getUTCMinutes(),
    );
  }

  return localDateTime(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
}

function outcomeFromCell(value: SpreadsheetCell | undefined): Outcome {
  const text = toText(value).toLowerCase();
  if (text === "w" || text === "won" || text === "win") {
    return "won";
  }
  if (text === "l" || text === "lost" || text === "loss") {
    return "lost";
  }
  return "open";
}

function findHeaderRow(rows: SpreadsheetRows): number {
  return rows.findIndex((row) => {
    const values = row.map((cell) => toText(cell).toLowerCase());
    return values.includes("datetime") && values.some((value) => value === "odd" || value === "odds");
  });
}

function settingsFromWorkbook(rows: SpreadsheetRows): StrategySettings {
  const settingsRow = rows[1] ?? [];
  const baseStake = firstPositive(toNumber(settingsRow[3]), defaultSettings.baseStake);
  const importedMaxStake = toNumber(settingsRow[4]);
  const importedBalance = toNumber(settingsRow[5]);
  const importedGoalRate = toNumber(settingsRow[13]);
  const importedThreshold = toNumber(settingsRow[14]);
  const importedRounding = toNumber(settingsRow[17]);

  return {
    ...defaultSettings,
    baseStake,
    startingBalance: firstPositive(importedBalance, defaultSettings.startingBalance),
    goalRate:
      importedGoalRate !== undefined && importedGoalRate >= 0 && importedGoalRate <= 1
        ? importedGoalRate
        : defaultSettings.goalRate,
    threshold: firstPositive(importedThreshold, defaultSettings.threshold),
    stakeRounding:
      importedRounding !== undefined
        ? Math.max(0, Math.min(4, Math.trunc(importedRounding)))
        : defaultSettings.stakeRounding,
    maxStake: Math.max(
      defaultSettings.maxStake,
      firstPositive(importedMaxStake, defaultSettings.maxStake),
      baseStake,
    ),
  };
}

function betsFromWorkbook(rows: SpreadsheetRows, headerRow: number): UnstampedBet[] {
  const headers = rows[headerRow] ?? [];
  const normalizedHeaders = headers.map((cell) => toText(cell).toLowerCase());
  const dateColumn = normalizedHeaders.findIndex((value) => value === "datetime" || value === "date");
  const oddsColumn = normalizedHeaders.findIndex((value) => value === "odd" || value === "odds");
  const sourceBetColumn = normalizedHeaders.findIndex(
    (value, index) => value === "bet" && index < oddsColumn,
  );
  const calculatedStakeColumn = normalizedHeaders.findIndex(
    (value, index) => value === "bet" && index > oddsColumn,
  );
  const activityColumn = dateColumn - 1;

  if (dateColumn < 0 || oddsColumn < 0) {
    throw new Error("The workbook needs DATETIME and ODD columns to import.");
  }

  return rows
    .slice(headerRow + 1)
    .flatMap((row, offset) => {
      if (activityColumn >= 0 && toText(row[activityColumn]).toLowerCase() !== "x") {
        return [];
      }

      const odds = toNumber(row[oddsColumn]);
      if (odds === undefined || odds <= 1) {
        return [];
      }

      const stake = toNumber(row[calculatedStakeColumn]);
      const label = toText(row[sourceBetColumn]) || `Bet ${offset + 1}`;;
      const bet: UnstampedBet = {
        id: `import-${headerRow + offset + 2}-${Date.now()}`,
        placedAt: dateFromCell(row[dateColumn], row[dateColumn + 1]),
        label,
        odds,
        outcome: outcomeFromCell(row[oddsColumn + 1]),
        ...(stake !== undefined && stake > 0 ? { stakeOverride: stake } : {}),
      };

      return [bet];
    });
}

export async function importWorkbook(file: File): Promise<ImportedWorkbook> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error("Choose an .xlsx workbook.");
  }

  const rows = (await readSheet(file)) as unknown as SpreadsheetRows;
  const headerRow = findHeaderRow(rows);

  if (headerRow < 0) {
    throw new Error("This workbook does not match the expected FairBets layout.");
  }

  const bets = betsFromWorkbook(rows, headerRow);
  if (bets.length === 0) {
    throw new Error("No active bets were found in the workbook.");
  }

  const settings = settingsFromWorkbook(rows);

  return {
    ledgerName: file.name.replace(/\.xlsx$/i, ""),
    settings,
    bets: stampBets(bets, settings),
  };
}
