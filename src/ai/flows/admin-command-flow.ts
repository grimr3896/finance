'use server';
/**
 * @fileOverview An AI flow for processing admin commands sent via email.
 *
 * - processAdminCommand - A function that handles parsing and responding to admin commands.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { DateRangeSchema, AdminCommandInputSchema, AdminCommandOutputSchema, type AdminCommandInput, type AdminCommandOutput } from '@/ai/schemas/admin-command-schemas';

// MOCK DATA TOOLS

const getProfit = ai.defineTool(
  {
    name: 'getProfit',
    description: 'Returns the net profit for a given date range.',
    inputSchema: DateRangeSchema,
    outputSchema: z.object({ profit: z.number() }),
  },
  async ({ startDate, endDate }) => {
    console.log(`TOOL: getProfit called for ${startDate} to ${endDate || startDate}`);
    return { profit: Math.floor(Math.random() * 50000) + 10000 };
  }
);

const getStockAlerts = ai.defineTool(
  {
    name: 'getStockAlerts',
    description: 'Returns items that are below the minimum stock threshold.',
    inputSchema: z.object({}),
    outputSchema: z.object({
      alerts: z.array(z.object({ item: z.string(), stock: z.number(), threshold: z.number() })),
    }),
  },
  async () => {
    console.log('TOOL: getStockAlerts called');
    return {
      alerts: [
        { item: 'Guinness', stock: 8, threshold: 10 },
        { item: 'Heineken', stock: 2, threshold: 5 },
      ],
    };
  }
);

const getCashierPerformance = ai.defineTool(
    {
        name: 'getCashierPerformance',
        description: 'Returns a summary of performance for each cashier within a given date range.',
        inputSchema: DateRangeSchema,
        outputSchema: z.object({
            performance: z.array(z.object({
                cashier: z.string(),
                revenue: z.number(),
                transactions: z.number(),
            })),
        }),
    },
    async ({ startDate, endDate }) => {
        console.log(`TOOL: getCashierPerformance called for ${startDate} to ${endDate || startDate}`);
        return {
            performance: [
                { cashier: 'John D.', revenue: 15230, transactions: 45 },
                { cashier: 'Jane S.', revenue: 12890, transactions: 38 },
            ],
        };
    }
);

const getTopSellers = ai.defineTool(
    {
        name: 'getTopSellers',
        description: 'Returns the top-selling products for a given date range.',
        inputSchema: DateRangeSchema,
        outputSchema: z.object({
            sellers: z.array(z.object({
                item: z.string(),
                quantitySold: z.number(),
            })),
        }),
    },
    async ({ startDate, endDate }) => {
        console.log(`TOOL: getTopSellers called for ${startDate} to ${endDate || startDate}`);
        return {
            sellers: [
                { item: 'Tusker', quantitySold: 120 },
                { item: 'Draft Beer (250ml)', quantitySold: 95 },
                { item: 'Guinness', quantitySold: 80 },
            ],
        };
    }
);


const processAdminCommandPrompt = ai.definePrompt({
  name: 'processAdminCommandPrompt',
  input: { schema: AdminCommandInputSchema },
  output: { schema: AdminCommandOutputSchema },
  tools: [getProfit, getStockAlerts, getCashierPerformance, getTopSellers],
  prompt: `You are an AI assistant for a business admin. Your task is to parse commands from an email and use the provided tools to generate a data report.

IMPORTANT RULES:
1.  **Authorization**: You ONLY respond to requests from the registered admin email: 'admin@barbuddy.app'. If the email is from anyone else, your only response must be "Unauthorized request."
2.  **Command Recognition**: Analyze the email content to identify one or more commands. Commands can be in the subject or body.
3.  **Date Validation**: All dates are in DD-MM-YYYY format. If a command uses an invalid date format, your reply for that command must be: "Command not recognized. Please use a valid command and date format DD-MM-YYYY."
4.  **Tool Usage**: Use the available tools to fetch the data for each valid command. If a command requires a date range (e.g., "WEEKLY"), ensure you provide both startDate and endDate to the tool. For single-day commands, startDate and endDate can be the same.
5.  **Formatted Response**:
    *   Start the response with a summary of the request period.
    *   Format the data clearly, using markdown for tables or lists where appropriate.
    *   If multiple commands are present, generate a separate, clearly demarcated section for each report in a single reply.
    *   Do NOT include any extra information or pleasantries. Only provide the requested data.

Here is the email content to process:
{{{emailContent}}}
`,
});

const processAdminCommandFlow = ai.defineFlow(
  {
    name: 'processAdminCommandFlow',
    inputSchema: AdminCommandInputSchema,
    outputSchema: AdminCommandOutputSchema,
  },
  async (input) => {
    const { output } = await processAdminCommandPrompt(input);
    return output!;
  }
);


export async function processAdminCommand(input: AdminCommandInput): Promise<AdminCommandOutput> {
    return processAdminCommandFlow(input);
}
