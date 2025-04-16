'use server';
/**
 * @fileOverview Summarizes theological content provided by the user.
 *
 * - summarizeTheologicalContent - A function that summarizes theological content.
 * - SummarizeTheologicalContentInput - The input type for the summarizeTheologicalContent function.
 * - SummarizeTheologicalContentOutput - The return type for the summarizeTheologicalContent function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeTheologicalContentInputSchema = z.object({
  content: z.string().describe('The theological content to summarize.'),
});
export type SummarizeTheologicalContentInput = z.infer<typeof SummarizeTheologicalContentInputSchema>;

const SummarizeTheologicalContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the theological content.'),
});
export type SummarizeTheologicalContentOutput = z.infer<typeof SummarizeTheologicalContentOutputSchema>;

export async function summarizeTheologicalContent(input: SummarizeTheologicalContentInput): Promise<SummarizeTheologicalContentOutput> {
  return summarizeTheologicalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTheologicalContentPrompt',
  input: {
    schema: z.object({
      content: z.string().describe('The theological content to summarize.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the theological content.'),
    }),
  },
  prompt: `You are an expert theologian. Please provide a concise summary of the following theological content:\n\nContent: {{{content}}}`,
});

const summarizeTheologicalContentFlow = ai.defineFlow<
  typeof SummarizeTheologicalContentInputSchema,
  typeof SummarizeTheologicalContentOutputSchema
>({
  name: 'summarizeTheologicalContentFlow',
  inputSchema: SummarizeTheologicalContentInputSchema,
  outputSchema: SummarizeTheologicalContentOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
