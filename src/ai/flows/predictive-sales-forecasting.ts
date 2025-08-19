'use server';

/**
 * @fileOverview Predicts sales trends and recommends optimal stock levels.
 *
 * - predictiveSalesForecasting - A function that handles the sales forecasting process.
 * - PredictiveSalesForecastingInput - The input type for the predictiveSalesForecasting function.
 * - PredictiveSalesForecastingOutput - The return type for the predictiveSalesForecasting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveSalesForecastingInputSchema = z.object({
  historicalSalesData: z
    .string()
    .describe('Historical sales data, preferably in CSV format.'),
  timeframe: z
    .string()
    .describe(
      'The timeframe for the forecast (e.g., next week, next month).'
    ),
  currentStockLevels: z
    .string()
    .describe('Current stock levels for each product.'),
});
export type PredictiveSalesForecastingInput = z.infer<
  typeof PredictiveSalesForecastingInputSchema
>;

const PredictiveSalesForecastingOutputSchema = z.object({
  salesForecast: z.string().describe('A forecast of sales trends.'),
  stockRecommendations: z
    .string()
    .describe('Optimal stock level recommendations.'),
});
export type PredictiveSalesForecastingOutput = z.infer<
  typeof PredictiveSalesForecastingOutputSchema
>;

export async function predictiveSalesForecasting(
  input: PredictiveSalesForecastingInput
): Promise<PredictiveSalesForecastingOutput> {
  return predictiveSalesForecastingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveSalesForecastingPrompt',
  input: {schema: PredictiveSalesForecastingInputSchema},
  output: {schema: PredictiveSalesForecastingOutputSchema},
  prompt: `You are an expert inventory manager. Analyze the historical sales data to forecast future sales trends for the following {{timeframe}} and provide optimal stock level recommendations based on current stock levels.

Historical Sales Data:
{{historicalSalesData}}

Current Stock Levels:
{{currentStockLevels}}`,
});

const predictiveSalesForecastingFlow = ai.defineFlow(
  {
    name: 'predictiveSalesForecastingFlow',
    inputSchema: PredictiveSalesForecastingInputSchema,
    outputSchema: PredictiveSalesForecastingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
