export interface AuditResult {
  url: string;
  timestamp: string;
  summary: AuditSummary;
  violations: Violation[];
  rawAxeResults?: any;
}

export interface AuditSummary {
  totalViolations: number;
  criticalViolations: number;
  seriousViolations: number;
  moderateViolations: number;
  minorViolations: number;
  totalPasses: number;
  incomplete: number;
}

export interface Violation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  help: string;
  helpUrl: string;
  wcagLevel: WCAGLevel;
  nodes: ViolationNode[];
}

export interface ViolationNode {
  target: string[];
  html: string;
  failureSummary: string;
  impact: string;
}

export type WCAGLevel =
  | "WCAG 2.0 A"
  | "WCAG 2.0 AA"
  | "WCAG 2.1 A"
  | "WCAG 2.1 AA"
  | "Other";

export interface Plugin {
  name: string;
  version: string;
  run(auditResult: AuditResult): Promise<PluginResult>;
}

export interface PluginResult {
  pluginName: string;
  additionalViolations?: Violation[];
  recommendations?: string[];
  metadata?: Record<string, any>;
}
