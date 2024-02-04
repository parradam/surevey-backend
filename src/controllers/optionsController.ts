import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  createOptionBodySchema,
  createOptionParamsSchema,
} from "../schemas/accessCodeSchemas";

export const createOption = async (
  req: Request,
  res: Response,
  prismaInstance?: PrismaClient
) => {
  const prisma = prismaInstance || new PrismaClient();

  try {
    const paramsValidation = createOptionParamsSchema.safeParse(req.params);
    const bodyValidation = createOptionBodySchema.safeParse(req.body);

    if (!paramsValidation.success) {
      return res.status(400).json(paramsValidation.error);
    }

    if (!bodyValidation.success) {
      return res.status(400).json(bodyValidation.error);
    }

    const { pollId, accessCode } = req.params;
    const { option } = req.body;

    const foundPoll = await prisma.poll.findUnique({
      where: { id: Number(pollId) },
    });

    if (!foundPoll) {
      return res.status(404).json({ error: "Poll does not exist." });
    }

    const foundAccessCode = await prisma.accessCode.findUnique({
      where: {
        code: accessCode,
        pollId: Number(pollId),
      },
    });

    if (!foundAccessCode) {
      return res.status(401).json({ error: "Access code not found." });
    } else if (foundAccessCode.type !== "admin") {
      return res.status(401).json({
        error: "You do not have permission to perform this action.",
      });
    }

    const optionData: Prisma.OptionCreateInput = {
      option,
      poll: {
        connect: { id: Number(pollId) },
      },
    };

    const newOption = await prisma.option.create({
      data: optionData,
    });

    res.status(201).json(newOption);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create option.",
    });
  }
};
