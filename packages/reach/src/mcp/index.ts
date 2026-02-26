#!/usr/bin/env node

import { AccessibilityAuditorMCPServer } from './server.js';

async function main() {
  const server = new AccessibilityAuditorMCPServer();
  await server.run();
}

main().catch((error) => {
  console.error('MCP Server error:', error);
  process.exit(1);
});
