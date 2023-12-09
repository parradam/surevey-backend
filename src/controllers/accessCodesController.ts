import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import {
  createAccessCodeBodySchema,
  createAccessCodeParamsSchema,
} from "../schemas/accessCodeSchemas";

export const createAccessCode = async (
  req: Request,
  res: Response,
  prismaInstance?: PrismaClient
) => {
  const prisma = prismaInstance || new PrismaClient();

  try {
    const paramsValidation = createAccessCodeParamsSchema.safeParse(req.params);
    const result = createAccessCodeBodySchema.safeParse(req.body);

    if (!paramsValidation.success) {
      return res.status(400).json(paramsValidation.error);
    }

    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const { pollId } = req.params;
    const { code, type } = req.body;

    const foundPoll = await prisma.poll.findUnique({
      where: { id: Number(pollId) },
    });

    if (!foundPoll) {
      return res.status(404).json({ error: "Poll does not exist." });
    }

    const foundAccessCode = await prisma.accessCode.findUnique({
      where: {
        code,
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

    const accessCodeData: Prisma.AccessCodeCreateInput = {
      type,
      code: randomUUID(),
      poll: {
        connect: { id: Number(pollId) },
      },
    };

    const newAccessCode = await prisma.accessCode.create({
      data: accessCodeData,
    });

    res.status(201).json(newAccessCode);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create access code.",
    });
  }
};
