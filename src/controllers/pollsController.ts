import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Prisma, PrismaClient } from "@prisma/client";
import { createPollRequestSchema } from "../schemas/pollSchemas";

interface CreatePollRequest {
  title: string;
  description?: string;
  maxVotesPerOption: number;
  maxVotesPerAccessCode: number;
  closingAt: string;
}

export const createPoll = async (
  req: Request,
  res: Response,
  prismaInstance?: PrismaClient
) => {
  const prisma = prismaInstance || new PrismaClient();

  try {
    const result = createPollRequestSchema.safeParse(req.body);

    if (!result.success) {
      console.error(result.error);
      return res.status(400).json(result.error);
    }

    const {
      title,
      description,
      maxVotesPerOption,
      maxVotesPerAccessCode,
      closingAt,
    }: CreatePollRequest = req.body;

    const accessCodeData: Prisma.AccessCodeCreateWithoutPollInput = {
      type: "admin",
      code: randomUUID(),
    };

    const pollData: Prisma.PollCreateInput = {
      title,
      description,
      maxVotesPerOption,
      maxVotesPerAccessCode,
      closingAt,
      accessCodes: { create: accessCodeData },
    };

    const poll = await prisma.poll.create({
      data: pollData,
      include: { accessCodes: { where: { type: "admin" } } },
    });

    res.status(201).json(poll);
  } catch (error) {
    console.error("Error creating poll:", error);

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create poll.",
    });
  }
};
