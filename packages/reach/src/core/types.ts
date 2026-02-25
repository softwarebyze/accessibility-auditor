export interface AuditResult {
  url: string;
  timestamp: string;
  summary: AuditSummary;
  violations: Violation[];
  rawAxeResults?: AxeResults;
  manualChecks: ManualCheckResult[];
}

export interface AxeResults {
  violations: AxeViolation[];
  passes: AxeRule[];
  incomplete: AxeRule[];
}

export interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | undefined;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
}

export interface AxeNode {
  target: string[];
  html: string;
  failureSummary: string;
  impact: string;
}

export interface AxeRule {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNode[];
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
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
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

export type WCAGLevel = 'WCAG 2.0 A' | 'WCAG 2.0 AA' | 'WCAG 2.1 A' | 'WCAG 2.1 AA' | 'Other';

export interface Plugin {
  name: string;
  version: string;
  run(auditResult: AuditResult): Promise<PluginResult>;
}

export interface PluginResult {
  pluginName: string;
  additionalViolations?: Violation[];
  recommendations?: string[];
  metadata?: Record<string, unknown>;
}

export type ManualCheckCategory = 'common' | 'audiovisual' | 'forms';

export type ManualCheckAutomation = 'automated' | 'manual' | 'hybrid';

export type ManualCheckStatus = 'pass' | 'fail' | 'needs-review' | 'manual';

export interface ManualCheckDefinition {
  id: string;
  title: string;
  category: ManualCheckCategory;
  description: string;
  whyItMatters: string;
  whatToLookFor: string[];
  automation: ManualCheckAutomation;
  relatedRuleIds?: string[];
  manualNotes?: string;
}

export interface ManualCheckResult extends ManualCheckDefinition {
  status: ManualCheckStatus;
  notes?: string;
}
