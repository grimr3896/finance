/**
 * @fileOverview Zod schemas and TypeScript types for the Admin Command flow tools.
 */

import { z } from 'genkit';

const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
const monthYearRegex = /^[A-Z][a-z]+-\d{4}$/i;

// Helper to transform DD-MM-YYYY to YYYY-MM-DD
const transformDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
};

export const DateInputSchema = z.object({
  date: z.string().regex(dateRegex, { message: "Invalid date format. Use DD-MM-YYYY" })
    .transform(transformDate)
    .describe("The date for the report in DD-MM-YYYY format."),
});
export type DateInput = z.infer<typeof DateInputSchema>;


export const DateRangeInputSchema = z.object({
  startDate: z.string().regex(dateRegex, { message: "Invalid start date format. Use DD-MM-YYYY" })
    .transform(transformDate)
    .describe("The start date for the report in DD-MM-YYYY format."),
  endDate: z.string().regex(dateRegex, { message: "Invalid end date format. Use DD-MM-YYYY" })
    .transform(transformDate)
    .describe("The end date for the report in DD-MM-YYYY format."),
});
export type DateRangeInput = z.infer<typeof DateRangeInputSchema>;


export const MonthYearInputSchema = z.object({
  monthYear: z.string().regex(monthYearRegex, { message: "Invalid month-year format. Use MONTH-YYYY" })
    .describe("The month and year for the report, e.g., 'AUGUST-2025'."),
});
export type MonthYearInput = z.infer<typeof MonthYearInputSchema>;

// A union of all possible period types for commands that can accept any.
export const PeriodInputSchema = z.union([DateInputSchema, DateRangeInputSchema, MonthYearInputSchema]);
export type PeriodInput = z.infer<typeof PeriodInputSchema>;
