import type { AuditResult } from "../core/types.js";

export class JsonReporter {
  static report(result: AuditResult): string {
    return JSON.stringify(result, null, 2);
  }

  static saveToFile(result: AuditResult, filename: string): void {
    const fs = require("fs");
    fs.writeFileSync(filename, this.report(result));
  }
}
