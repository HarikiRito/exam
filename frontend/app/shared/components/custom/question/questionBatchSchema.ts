import { z } from 'zod';

const questionOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  correct: z.boolean(),
});

const questionItemSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  points: z.number().min(0, 'Points must be non-negative'),
  options: z
    .array(questionOptionSchema)
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed'),
  explanation: z.string().optional(),
  sources: z.array(z.string()).optional(),
});

export const questionBatchSchema = z.array(questionItemSchema).min(1, 'At least one question is required');

export type QuestionBatchData = z.infer<typeof questionBatchSchema>;
export type QuestionItemData = z.infer<typeof questionItemSchema>;
export type QuestionOptionData = z.infer<typeof questionOptionSchema>;
