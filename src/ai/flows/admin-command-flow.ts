'use server';
/**
 * @fileOverview An AI agent for processing business commands from admin emails.
 *
 * - processAdminCommand - A function that handles parsing and responding to admin commands.
 * - AdminCommandInput - The input type for the processAdminCommand function.
 * - AdminCommandOutput - The return type for the processAdminCommand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  AdminCommandInputSchema,
  AdminCommandOutputSchema,
  DateInputSchema,
  PeriodInputSchema,
  type AdminCommandInput,
  type AdminCommandOutput,
} from '@/ai/schemas/admin-command-schemas';
import { format } from 'date-fns';


// #region MOCK DATA AND TOOLS
// In a real application, these tools would query a database. For now, they return mock data.

const getProfit = ai.defineTool(
  {
    name: 'getProfit',
    description: 'Returns the net profit for a specific day.',
    inputSchema: DateInputSchema,
    outputSchema: z.object({
      date: z.string(),
      profit: z.number()
    }),
  },
  async ({ date }) => {
    // Mock data generation
    return {
      date,
      profit: Math.floor(Math.random() * 20000) + 10000,
    };
  }
);

const getTotalEarnings = ai.defineTool(
    {
        name: 'getTotalEarnings',
        description: 'Returns total earnings for a specific day, including revenue and payment breakdowns.',
        inputSchema: DateInputSchema,
        outputSchema: z.object({
            date: z.string(),
            revenue: z.number(),
            cashPayments: z.number(),
            cardPayments: z.number(),
        }),
    },
    async ({ date }) => {
        // Mock data generation
        const revenue = Math.floor(Math.random() * 50000) + 30000;
        const cashPayments = revenue * 0.6;
        const cardPayments = revenue * 0.4;
        return { date, revenue, cashPayments, cardPayments };
    }
);

const getStockAlerts = ai.defineTool(
    {
        name: 'getStockAlerts',
        description: 'Returns a list of items that are below the minimum stock level.',
        inputSchema: z.object({}),
        outputSchema: z.array(z.object({ name: z.string(), stock: z.number() })),
    },
    async () => {
        // Mock data
        return [
            { name: 'Guinness', stock: 8 },
            { name: 'Heineken', stock: 2 },
        ];
    }
);

const getCashierPerformance = ai.defineTool(
    {
        name: 'getCashierPerformance',
        description: 'Returns performance data for each cashier for a given period.',
        inputSchema: PeriodInputSchema,
        outputSchema: z.array(z.object({
            cashier: z.string(),
            revenue: z.number(),
            transactions: z.number(),
        })),
    },
    async ({ period }) => {
        // Mock data
        return [
            { cashier: 'John D.', revenue: 25400, transactions: 45 },
            { cashier: 'Jane S.', revenue: 21800, transactions: 38 },
        ];
    }
);

const getTopSellers = ai.defineTool(
    {
        name: 'getTopSellers',
        description: 'Returns the top-selling products for a given period.',
        inputSchema: PeriodInputSchema,
        outputSchema: z.array(z.object({ name: z.string(), quantitySold: z.number() })),
    },
    async ({ period }) => {
        // Mock data
        return [
            { name: 'Tusker', quantitySold: 120 },
            { name: 'Draft Beer (250ml)', quantitySold: 95 },
            { name: 'White Cap', quantitySold: 88 },
        ];
    }
);

// #endregion

const commandProcessorPrompt = ai.definePrompt({
    name: 'commandProcessorPrompt',
    input: { schema: AdminCommandInputSchema },
    output: { schema: z.any() },
    tools: [getProfit, getTotalEarnings, getStockAlerts, getCashierPerformance, getTopSellers],
    prompt: `You are an automated email reporting system for a business.
Your task is to parse incoming emails from the admin and respond with the requested business data.

- **Security**: You MUST ONLY respond to emails from the registered admin email: 'admin@barbuddy.app'. If the 'from' address is different, your response should be to do nothing.
- **Commands**: The user will issue commands in the subject or body. You must use the available tools to fulfill these commands.
- **Dates**: Dates will be in DD-MM-YYYY format. You must convert them to YYYY-MM-DD for the tools.
- **Multiple Commands**: An email may contain multiple commands. You must call the appropriate tool for each command.
- **Invalid Commands**: If a command is not recognized or a date format is invalid, your response for that specific command should be: "Command not recognized. Please use a valid command and date format DD-MM-YYYY."

Current Date for context: ${format(new Date(), 'yyyy-MM-dd')}

Here is the incoming email:
From: {{{from}}}
Subject: {{{subject}}}

Body:
{{{body}}}

Analyze the email and call the necessary tools to gather the requested data.
`,
});

const responseFormatterPrompt = ai.definePrompt({
    name: 'responseFormatterPrompt',
    input: { schema: z.object({
        originalRequest: AdminCommandInputSchema,
        toolOutputs: z.any().describe("The JSON output from the tool calls.")
    }) },
    output: { schema: AdminCommandOutputSchema },
    prompt: `You are the response formatting part of an automated email reporting system.
You have the original user request and the data retrieved from the system's tools.
Your task is to format this data into a clear, concise, and professional email response.

- **Clarity**: Present data in a clean way. Use Markdown for tables or lists where appropriate.
- **Summarize**: Each piece of information should have a clear header related to the original command.
- **Completeness**: Include all the data returned by the tools.
- **Invalid Commands**: If any part of the tool output contains an error message like "Command not recognized", include that in the response for the relevant command.

Here is the data:
Original Request:
From: {{{originalRequest.from}}}
Subject: {{{originalRequest.subject}}}
Body: {{{originalRequest.body}}}

Tool Output Data (JSON):
\`\`\`json
{{{jsonEncode toolOutputs}}}
\`\`\`

Now, generate the final email reply body. Only generate the body, not the subject or recipient.
Set 'shouldReply' to false if the original sender was not the admin ('admin@barbuddy.app'). Otherwise, set it to true.
`,
});


const processAdminCommandFlow = ai.defineFlow(
  {
    name: 'processAdminCommandFlow',
    inputSchema: AdminCommandInputSchema,
    outputSchema: AdminCommandOutputSchema,
  },
  async (input) => {
    // Hardcoded admin email for security check
    const ADMIN_EMAIL = 'admin@barbuddy.app';
    if (input.from.toLowerCase() !== ADMIN_EMAIL) {
        return {
            shouldReply: false,
            replyBody: 'Error: Request is not from the authorized admin email.',
        };
    }

    const llmResponse = await commandProcessorPrompt(input);
    const toolOutputs = [];

    for (const part of llmResponse.parts) {
        if (part.toolRequest) {
            console.log('Executing tool:', part.toolRequest.name, 'with input:', part.toolRequest.input);
            const toolResponse = await ai.runTool(part.toolRequest);
            toolOutputs.push({
                toolName: part.toolRequest.name,
                response: toolResponse
            });
        }
    }
    
    if (toolOutputs.length === 0) {
        return {
            shouldReply: true,
            replyBody: "Command not recognized. Please use a valid command and date format DD-MM-YYYY."
        }
    }
    
    const response = await responseFormatterPrompt({
        originalRequest: input,
        toolOutputs: toolOutputs
    });

    return response.output()!;
  }
);

export async function processAdminCommand(input: AdminCommandInput): Promise<AdminCommandOutput> {
    return processAdminCommandFlow(input);
}
