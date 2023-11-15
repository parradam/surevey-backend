import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPoll = async (req: Request, res: Response) => {
  const {
    title,
    description,
    maxVotesPerOption,
    maxVotesPerAccessCode,
    closingAt,
  } = req.body;

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

  res.json(poll);
};

export const createAccessCode = async (req: Request, res: Response) => {
  const { pollId } = req.params;
  const { code, type } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Bad request: missing access code." });
  }

  if (!pollId) {
    return res.status(400).json({ error: "Bad request: missing poll ID." });
  }

  const foundPoll = await prisma.poll.findUnique({
    where: { id: Number(pollId) },
  });

  if (!foundPoll) {
    return res.status(404).json({ error: "Not found: poll does not exist." });
  }

  const foundAccessCode = await prisma.accessCode.findUnique({
    where: {
      code,
      pollId: Number(pollId),
    },
  });

  if (!foundAccessCode) {
    return res
      .status(401)
      .json({ error: "Unauthorized: access code does not exist." });
  } else if (foundAccessCode.type !== "admin") {
    return res.status(401).json({
      error: "Unauthorized: you do not have permission to perform this action.",
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

  res.json(newAccessCode);
};
