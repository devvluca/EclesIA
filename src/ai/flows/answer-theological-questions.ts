'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering theological questions about the Igreja Episcopal Carismática do Brasil and Anglican tradition.
 *
 * - answerTheologicalQuestions - A function that takes a question as input and returns an answer from the AI.
 * - AnswerTheologicalQuestionsInput - The input type for the answerTheologicalQuestions function.
 * - AnswerTheologicalQuestionsOutput - The return type for the answerTheologicalQuestions function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnswerTheologicalQuestionsInputSchema = z.object({
  question: z.string().describe('The theological question to answer.'),
});
export type AnswerTheologicalQuestionsInput = z.infer<
  typeof AnswerTheologicalQuestionsInputSchema
>;

const AnswerTheologicalQuestionsOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type AnswerTheologicalQuestionsOutput = z.infer<
  typeof AnswerTheologicalQuestionsOutputSchema
>;

export async function answerTheologicalQuestions(
  input: AnswerTheologicalQuestionsInput
): Promise<AnswerTheologicalQuestionsOutput> {
  return answerTheologicalQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerTheologicalQuestionsPrompt',
  input: {
    schema: z.object({
      question: z.string().describe('The theological question to answer.'),
    }),
  },
  output: {
    schema: z.object({
      answer: z.string().describe('The AI-generated answer to the question.'),
    }),
  },
  prompt: `You are a knowledgeable AI assistant specialized in the Igreja Episcopal Carismática do Brasil.

  Please answer the following question to the best of your ability, drawing upon your knowledge of theological content related to the Igreja Episcopal Carismática do Brasil. Only refer to the Anglican tradition if the question specifically asks about it.

  Question: {{{question}}}`,
});

const answerTheologicalQuestionsFlow = ai.defineFlow<
  typeof AnswerTheologicalQuestionsInputSchema,
  typeof AnswerTheologicalQuestionsOutputSchema
>(
  {
    name: 'answerTheologicalQuestionsFlow',
    inputSchema: AnswerTheologicalQuestionsInputSchema,
    outputSchema: AnswerTheologicalQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
