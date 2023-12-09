import { z } from "zod";

const AccessCodeTypeEnum = z.enum(["admin", "view", "vote"], {
  errorMap: (issue, ctx) => ({
    message: "A valid access code type must be specified.",
  }),
});

export const createAccessCodeBodySchema = z.object({
  code: z.string().min(30, "The access code format is incorrect."),
  type: AccessCodeTypeEnum,
});

export const createAccessCodeParamsSchema = z.object({
  pollId: z.string().refine(
    (value) => {
      const coercedValue = Number(value);
      return !isNaN(coercedValue);
    },
    {
      message: "The poll ID must be a number.",
    }
  ),
});
