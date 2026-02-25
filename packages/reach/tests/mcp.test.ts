import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('MCP Server', () => {
  describe('MCP Server Code', () => {
    it('should have MCP server entry point', () => {
      const mcpIndexPath = join(process.cwd(), 'src', 'mcp', 'index.ts');
      const mcpIndexContent = readFileSync(mcpIndexPath, 'utf8');

      expect(mcpIndexContent).toContain('AccessibilityAuditorMCPServer');
      expect(mcpIndexContent).toContain('server');
    });

    it('should have MCP server implementation', () => {
      const mcpServerPath = join(process.cwd(), 'src', 'mcp', 'server.ts');
      const mcpServerContent = readFileSync(mcpServerPath, 'utf8');

      expect(mcpServerContent).toContain('audit_website');
      expect(mcpServerContent).toContain('get_audit_history');
      expect(mcpServerContent).toContain('get_audit_result');
    });

    it('should define MCP tools correctly', () => {
      const mcpServerPath = join(process.cwd(), 'src', 'mcp', 'server.ts');
      const mcpServerContent = readFileSync(mcpServerPath, 'utf8');

      // Check that tools are properly defined
      expect(mcpServerContent).toContain("name: 'audit_website'");
      expect(mcpServerContent).toContain("name: 'get_audit_history'");
      expect(mcpServerContent).toContain("name: 'get_audit_result'");

      // Check that descriptions are present
      expect(mcpServerContent).toContain('description:');
      expect(mcpServerContent).toContain('accessibility audit');
    });
  });
});
