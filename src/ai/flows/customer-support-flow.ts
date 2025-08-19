'use server';

/**
 * @fileOverview A customer support chatbot for the bar.
 *
 * - customerSupport - A function that handles customer support queries.
 * - CustomerSupportInput - The input type for the customerSupport function.
 * - CustomerSupportOutput - The return type for the customerSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerSupportInputSchema = z.object({
  question: z.string().describe('The customer\'s question.'),
});
export type CustomerSupportInput = z.infer<typeof CustomerSupportInputSchema>;

const CustomerSupportOutputSchema = z.object({
  answer: z.string().describe('The chatbot\'s answer to the question.'),
});
export type CustomerSupportOutput = z.infer<typeof CustomerSupportOutputSchema>;

export async function customerSupport(
  input: CustomerSupportInput
): Promise<CustomerSupportOutput> {
  return customerSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerSupportPrompt',
  input: {schema: CustomerSupportInputSchema},
  output: {schema: CustomerSupportOutputSchema},
  prompt: `You are a friendly and helpful customer support chatbot for a bar called "BarBuddy POS".

Your goal is to answer customer questions accurately and concisely.

Here is some information about the bar:
- **Opening Hours**: 
  - Monday-Thursday: 4 PM - 12 AM
  - Friday-Saturday: 4 PM - 2 AM
  - Sunday: 2 PM - 10 PM
- **Menu**: We sell a variety of beers including Tusker, Guinness, White Cap, Heineken, and Pilsner. We also sell draft beer and spirits like Drum.
- **Promotions**:
  - Happy Hour: Monday-Friday, 5 PM - 7 PM. All local beers are 20% off.
  - Tusker Tuesdays: Get a free Tusker with any meal purchase on Tuesdays.

Answer the following customer question:
"{{{question}}}"

If the question is outside the scope of the bar's services, politely decline to answer.
`,
});

const customerSupportFlow = ai.defineFlow(
  {
    name: 'customerSupportFlow',
    inputSchema: CustomerSupportInputSchema,
    outputSchema: CustomerSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
