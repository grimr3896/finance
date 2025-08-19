// anomaly-detection.ts
'use server';

/**
 * @fileOverview Anomaly detection AI agent for identifying discrepancies in stock levels.
 *
 * - detectStockAnomaly - A function that handles the stock anomaly detection process.
 * - DetectStockAnomalyInput - The input type for the detectStockAnomaly function.
 * - DetectStockAnomalyOutput - The return type for the detectStockAnomaly function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectStockAnomalyInputSchema = z.object({
  expectedStockLevel: z
    .number()
    .describe('The expected stock level of a drink item.'),
  actualStockLevel: z
    .number()
    .describe('The actual stock level of the drink item.'),
  drinkName: z.string().describe('The name of the drink item.'),
  salesData: z
    .string()
    .describe(
      'Sales data for the drink item, including quantity sold and time period.'
    ),
  expensesData: z
    .string()
    .describe(
      'Expenses data related to the drink item, including purchase price and date.'
    ),
});
export type DetectStockAnomalyInput = z.infer<typeof DetectStockAnomalyInputSchema>;

const DetectStockAnomalyOutputSchema = z.object({
  isAnomaly: z
    .boolean()
    .describe(
      'Whether a significant discrepancy exists between expected and actual stock levels.'
    ),
  anomalyExplanation: z
    .string()
    .describe('Explanation of the potential anomaly, including possible causes.'),
  recommendedActions: z
    .string()
    .describe(
      'Recommended actions to investigate and address the potential anomaly.'
    ),
});
export type DetectStockAnomalyOutput = z.infer<typeof DetectStockAnomalyOutputSchema>;

export async function detectStockAnomaly(
  input: DetectStockAnomalyInput
): Promise<DetectStockAnomalyOutput> {
  return detectStockAnomalyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectStockAnomalyPrompt',
  input: {schema: DetectStockAnomalyInputSchema},
  output: {schema: DetectStockAnomalyOutputSchema},
  prompt: `You are an expert in inventory management and loss prevention for bars.

  Given the expected stock level, actual stock level, sales data, and expenses data for a drink item, you will analyze the data to determine if there is a significant discrepancy that indicates a potential anomaly (e.g., theft, spoilage, or accounting error).

  Drink Name: {{{drinkName}}}
  Expected Stock Level: {{{expectedStockLevel}}}
  Actual Stock Level: {{{actualStockLevel}}}
  Sales Data: {{{salesData}}}
  Expenses Data: {{{expensesData}}}

  Based on your analysis, set the isAnomaly field to true if a significant discrepancy is detected. Provide a detailed explanation of the potential anomaly in the anomalyExplanation field, including possible causes. In the recommendedActions field, suggest specific actions to investigate and address the potential anomaly.

  Consider factors such as typical sales patterns, recent deliveries, and potential waste or spoilage.
  `,
});

const detectStockAnomalyFlow = ai.defineFlow(
  {
    name: 'detectStockAnomalyFlow',
    inputSchema: DetectStockAnomalyInputSchema,
    outputSchema: DetectStockAnomalyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
