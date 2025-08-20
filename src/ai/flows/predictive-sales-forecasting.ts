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

const SalesRecordSchema = z.object({
  date: z.string().describe('The date of the sales record in ISO format (YYYY-MM-DD).'),
  total: z.number().int().nonnegative().describe('The total sales for that day.'),
});

const PredictiveSalesForecastingInputSchema = z.object({
  sales: z.array(SalesRecordSchema).describe('An array of historical sales records.'),
  horizonDays: z.number().int().positive().default(14).describe('The number of days to forecast.'),
});
export type PredictiveSalesForecastingInput = z.infer<typeof PredictiveSalesForecastingInputSchema>;

const ForecastPointSchema = z.object({
    date: z.string(),
    total: z.number(),
    lower: z.number(),
    upper: z.number(),
});

const PredictiveSalesForecastingOutputSchema = z.object({
    ok: z.boolean(),
    code: z.string().optional(),
    message: z.string().optional(),
    usedFallback: z.boolean().optional(),
    method: z.string().optional(),
    forecast: z.array(ForecastPointSchema).optional(),
});
export type PredictiveSalesForecastingOutput = z.infer<typeof PredictiveSalesForecastingOutputSchema>;

const ERRORS = {
  E_EMPTY_DATA: "No sales data provided. Add sales history and try again.",
  E_BAD_DATE: "One or more rows have an invalid date format. Use ISO like 2025-08-01.",
  E_BAD_AMOUNT: "One or more rows have invalid totals. Use non-negative integers.",
  E_TOO_SHORT: "Not enough data to model. Provide at least 14 days of sales.",
  E_INTERNAL: "Unexpected error while generating the forecast.",
};

function buildNaiveForecast(avg: number, horizonDays: number) {
  const out = [];
  const today = new Date();
  for (let i = 1; i <= horizonDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    out.push({
      date: d.toISOString().slice(0, 10),
      total: avg,
      lower: Math.max(0, Math.round(avg * 0.85)),
      upper: Math.round(avg * 1.15),
    });
  }
  return out;
}


export async function predictiveSalesForecasting(
  input: PredictiveSalesForecastingInput
): Promise<PredictiveSalesForecastingOutput> {
  return predictiveSalesForecastingFlow(input);
}


const predictiveSalesForecastingFlow = ai.defineFlow(
  {
    name: 'predictiveSalesForecastingFlow',
    inputSchema: PredictiveSalesForecastingInputSchema,
    outputSchema: PredictiveSalesForecastingOutputSchema,
  },
  async ({ sales, horizonDays }) => {
    try {
        if (sales.length === 0) {
            return { ok: false, code: "E_EMPTY_DATA", message: ERRORS.E_EMPTY_DATA };
        }

        const rows: { date: Date, total: number }[] = [];
        for (const r of sales) {
            const d = new Date(r.date);
            if (isNaN(d.getTime())) {
                return { ok: false, code: "E_BAD_DATE", message: ERRORS.E_BAD_DATE };
            }
             if (r.total < 0 || !Number.isInteger(r.total)) {
                return { ok: false, code: "E_BAD_AMOUNT", message: ERRORS.E_BAD_AMOUNT };
            }
            rows.push({ date: d, total: r.total });
        }
        rows.sort((a, b) => a.date.getTime() - b.date.getTime());

        if (rows.length < 14) {
            const avg = Math.round(rows.reduce((s, r) => s + r.total, 0) / rows.length);
            const forecast = buildNaiveForecast(avg, horizonDays);
            return {
                ok: true,
                usedFallback: true,
                method: "overall-average",
                message: ERRORS.E_TOO_SHORT,
                forecast,
            };
        }

        const lastN = rows.slice(-28);
        const byDOW: number[][] = Array.from({ length: 7 }, () => []);
        lastN.forEach(r => byDOW[r.date.getDay()].push(r.total));
        const weekdayMean = byDOW.map(arr => {
            if (!arr.length) return null;
            return Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
        });
        
        const overallAvg = Math.round(lastN.reduce((s, r) => s + r.total, 0) / lastN.length);
        const pattern = weekdayMean.map(v => (v == null ? overallAvg : v));
        
        const start = new Date(rows[rows.length - 1].date.toISOString().slice(0, 10)); // last date, midnight
        const forecast: { date: string, total: number, lower: number, upper: number }[] = [];
        for (let i = 1; i <= horizonDays; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dow = d.getDay();
            const point = pattern[dow];
            const lower = Math.max(0, Math.round(point * 0.85));
            const upper = Math.round(point * 1.15);
            forecast.push({
                date: d.toISOString().slice(0, 10),
                total: point,
                lower: lower,
                upper: upper,
            });
        }
        
        return {
            ok: true,
            usedFallback: true,
            method: "weekday-pattern",
            forecast,
        };

    } catch (err) {
        console.error("[forecast] error:", err);
        return { ok: false, code: "E_INTERNAL", message: ERRORS.E_INTERNAL };
    }
  }
);
