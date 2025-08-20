/**
 * @fileOverview Zod schemas and TypeScript types for the M-Pesa STK push flow.
 */

import { z } from 'genkit';

export const MpesaStkPushInputSchema = z.object({
  phoneNumber: z.string().describe("The customer's phone number in the format 254..."),
  amount: z.number().describe('The amount to be paid.'),
});
export type MpesaStkPushInput = z.infer<typeof MpesaStkPushInputSchema>;

export const MpesaStkPushOutputSchema = z.object({
  success: z.boolean().describe('Whether the STK push was successfully initiated.'),
  message: z.string().describe('A message indicating the status of the transaction.'),
  mpesaReceiptNumber: z.string().optional().describe('The M-Pesa receipt number for the transaction.'),
});
export type MpesaStkPushOutput = z.infer<typeof MpesaStkPushOutputSchema>;
