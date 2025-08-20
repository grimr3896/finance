/**
 * @fileOverview Zod schemas for the Admin Command email processing flow.
 */
import { z } from 'genkit';

export const DateRangeSchema = z.object({
  startDate: z.string().describe('The start date in DD-MM-YYYY format.'),
  endDate: z.string().optional().describe('The end date in DD-MM-YYYY format. Can be the same as the start date for single-day queries.'),
});

export const AdminCommandInputSchema = z.object({
  emailContent: z.string().describe("The full content of the email from the admin, including subject and body."),
});
export type AdminCommandInput = z.infer<typeof AdminCommandInputSchema>;


export const AdminCommandOutputSchema = z.object({
  replyContent: z.string().describe("The formatted reply to be sent back to the admin."),
});
export type AdminCommandOutput = z.infer<typeof AdminCommandOutputSchema>;
