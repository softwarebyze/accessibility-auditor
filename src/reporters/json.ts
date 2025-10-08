import type { AuditResult } from '../core/types.js';

export function report(result: AuditResult): string {
  return JSON.stringify(result, null, 2);
}

export async function saveToFile(result: AuditResult, filename: string): Promise<void> {
  await Bun.write(filename, report(result));
}
