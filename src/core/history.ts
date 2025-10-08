import { join } from "node:path";
import type { AuditResult } from "./types.js";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  url: string;
  summary: AuditResult["summary"];
  violations: number;
}

const HISTORY_DIR = "/tmp/a11y-audit-history";
const HISTORY_FILE = join(HISTORY_DIR, "history.json");

export async function saveAuditResult(result: AuditResult): Promise<string> {
  await ensureHistoryDirectory();

  const historyEntry: HistoryEntry = {
    id: generateId(),
    timestamp: result.timestamp,
    url: result.url,
    summary: result.summary,
    violations: result.violations.length,
  };

  const existingHistory = await loadHistory();
  existingHistory.push(historyEntry);

  // Keep only last 100 entries
  const trimmedHistory = existingHistory.slice(-100);

  await Bun.write(HISTORY_FILE, JSON.stringify(trimmedHistory, null, 2));

  // Also save individual result
  const resultFile = join(HISTORY_DIR, `${historyEntry.id}.json`);
  await Bun.write(resultFile, JSON.stringify(result, null, 2));

  return historyEntry.id;
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const file = Bun.file(HISTORY_FILE);
    if (!(await file.exists())) {
      return [];
    }

    const content = await file.text();
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function getAuditResult(id: string): Promise<AuditResult | null> {
  try {
    const resultFile = join(HISTORY_DIR, `${id}.json`);
    const file = Bun.file(resultFile);

    if (!(await file.exists())) {
      return null;
    }

    const content = await file.text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await Bun.write(HISTORY_FILE, "[]");
  } catch {
    // Ignore errors
  }
}

export async function generateReport(): Promise<string> {
  const history = await loadHistory();

  if (history.length === 0) {
    return "No audit history found.";
  }

  let report = "📊 Accessibility Audit History Report\n";
  report += `${"═".repeat(50)}\n\n`;

  // Summary statistics
  const totalAudits = history.length;
  const totalViolations = history.reduce(
    (sum, entry) => sum + entry.violations,
    0
  );
  const avgViolations = totalViolations / totalAudits;

  report += `Total Audits: ${totalAudits}\n`;
  report += `Total Violations: ${totalViolations}\n`;
  report += `Average Violations per Audit: ${avgViolations.toFixed(1)}\n\n`;

  // Recent audits
  report += "Recent Audits:\n";
  report += `${"-".repeat(30)}\n`;

  const recentAudits = history.slice(-10).reverse();
  recentAudits.forEach((entry, index) => {
    const date = new Date(entry.timestamp).toLocaleString();
    const status = entry.violations === 0 ? "✅" : "❌";
    report += `${index + 1}. ${status} ${entry.url}\n`;
    report += `   ${date} - ${entry.violations} violations\n`;
  });

  return report;
}

async function ensureHistoryDirectory(): Promise<void> {
  try {
    const dir = Bun.file(HISTORY_DIR);
    if (!(await dir.exists())) {
      await Bun.write(join(HISTORY_DIR, ".gitkeep"), "");
    }
  } catch {
    // Ignore errors
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
