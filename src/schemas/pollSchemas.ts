import { z } from "zod";

export const createPollRequestSchema = z.object({
  title: z.string().min(30, "The title is too short."),
  description: z.string(),
  maxVotesPerOption: z
    .number()
    .min(1, "There must be at least one vote per option.")
    .max(100, "Too many votes per option specified."),
  maxVotesPerAccessCode: z
    .number()
    .min(1, "There must be at least one vote per access code.")
    .max(100, "Too many votes per access code specified."),
  closingAt: z
    .string()
    .datetime("Invalid date specified.")
    .refine((value) => {
      const closingDate = new Date(value);
      const currentDate = new Date();
      return closingDate.getTime() - currentDate.getTime() > 0;
    }, "The closing date must be in the future."),
});
