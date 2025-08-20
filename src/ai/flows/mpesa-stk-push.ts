'use server';

/**
 * @fileOverview A flow for initiating M-Pesa STK push payments.
 *
 * - requestMpesaPayment - A function that handles the M-Pesa STK push request.
 */

import { ai } from '@/ai/genkit';
import type { MpesaStkPushInput, MpesaStkPushOutput } from '@/ai/schemas/mpesa-schemas';
import { MpesaStkPushInputSchema, MpesaStkPushOutputSchema } from '@/ai/schemas/mpesa-schemas';

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
