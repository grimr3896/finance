'use server';

/**
 * @fileOverview A flow for initiating M-Pesa STK push payments.
 *
 * - requestMpesaPayment - A function that handles the M-Pesa STK push request.
 * - MpesaStkPushInput - The input type for the requestMpesaPayment function.
 * - MpesaStkPushOutput - The return type for the requestMpesaPayment function.
 */

import { ai } from '@/ai/genkit';
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

export async function requestMpesaPayment(
  input: MpesaStkPushInput
): Promise<MpesaStkPushOutput> {
  return mpesaStkPushFlow(input);
}

const mpesaStkPushFlow = ai.defineFlow(
  {
    name: 'mpesaStkPushFlow',
    inputSchema: MpesaStkPushInputSchema,
    outputSchema: MpesaStkPushOutputSchema,
  },
  async (input) => {
    console.log(`Initiating STK push to ${input.phoneNumber} for KES ${input.amount}`);

    // In a real application, this is where you would make a call to the Safaricom Daraja API.
    // 1. Get an access token from the Daraja API.
    // 2. Make the STK push request with the phone number, amount, a callback URL, and other details.
    // 3. The Daraja API would then send a callback to your specified URL with the transaction result.
    //    This flow would typically end here, and the callback handler would update the order status.

    // For this simulation, we'll just wait for a few seconds to mimic the network request
    // and the customer entering their PIN.
    await new Promise(resolve => setTimeout(resolve, 3000));

    // We will simulate a successful response.
    const success = true; // Assume success for simulation

    if (success) {
      // Generate a mock M-Pesa receipt number
      const mockReceipt = `S${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      console.log(`Simulated successful payment for ${input.phoneNumber}. Receipt: ${mockReceipt}`);
      return {
        success: true,
        message: 'Payment successfully processed.',
        mpesaReceiptNumber: mockReceipt,
      };
    } else {
      console.log(`Simulated failed payment for ${input.phoneNumber}.`);
      return {
        success: false,
        message: 'Payment failed or was cancelled by the user.',
      };
    }
  }
);
