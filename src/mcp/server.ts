import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { AccessibilityAuditor } from '../core/auditor.js';
import { generateReport, getAuditResult, saveAuditResult } from '../core/history.js';

export class AccessibilityAuditorMCPServer {
  private server: Server;
  private auditor: AccessibilityAuditor;

  constructor() {
    this.server = new Server(
      {
        name: 'accessibility-auditor',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.auditor = new AccessibilityAuditor();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'audit_website',
            description: 'Audit a website for accessibility issues using axe-core',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL of the website to audit',
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in milliseconds (default: 30000)',
                  default: 30000,
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'get_audit_history',
            description: 'Get the history of accessibility audits',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of entries to return',
                  default: 10,
                },
              },
            },
          },
          {
            name: 'get_audit_result',
            description: 'Get a specific audit result by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the audit result to retrieve',
                },
              },
              required: ['id'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'audit_website':
            return await this.handleAuditWebsite(args as { url: string; timeout?: number });

          case 'get_audit_history':
            return await this.handleGetAuditHistory(args as { limit?: number });

          case 'get_audit_result':
            return await this.handleGetAuditResult(args as { id: string });

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async handleAuditWebsite(args: { url: string; timeout?: number }) {
    const result = await this.auditor.audit(args.url, {
      timeout: args.timeout || 30000,
    });

    // Save to history
    await saveAuditResult(result);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleGetAuditHistory(_args: { limit?: number }) {
    const report = await generateReport();

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  private async handleGetAuditResult(args: { id: string }) {
    const result = await getAuditResult(args.id);

    if (!result) {
      return {
        content: [
          {
            type: 'text',
            text: `No audit result found with ID: ${args.id}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Cleanup on exit
    process.on('SIGINT', async () => {
      await this.auditor.close();
      process.exit(0);
    });
  }
}
