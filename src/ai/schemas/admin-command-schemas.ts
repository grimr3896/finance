/**
 * @fileOverview Zod schemas and TypeScript types for the Admin Command flow.
 */

import { z } from 'genkit';

// Helper to transform DD-MM-YYYY to YYYY-MM-DD
const transformDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
};

const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
const monthYearRegex = /^[A-Z][a-z]+-\d{4}$/i;

// Schemas for the main flow
export const AdminCommandInputSchema = z.object({
  from: z.string().email().describe("The admin's personal email address."),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The body content of the email.'),
});
export type AdminCommandInput = z.infer<typeof AdminCommandInputSchema>;

export const AdminCommandOutputSchema = z.object({
  shouldReply: z.boolean().describe('Whether a reply should be sent.'),
  replyBody: z
    .string()
    .describe('The generated email body for the reply.'),
});
export type AdminCommandOutput = z.infer<typeof AdminCommandOutputSchema>;

// Schemas for tools
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
