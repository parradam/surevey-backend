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

export const createOptionParamsSchema = z.object({
  pollId: z.string().refine(
    (value) => {
      const coercedValue = Number(value);
      return !isNaN(coercedValue);
    },
    {
      message: "The poll ID must be a number.",
    }
  ),
  accessCode: z.string().min(30, "The access code format is incorrect."),
});

export const createOptionBodySchema = z.object({
  option: z.string().min(1, "The option is invalid."),
});
