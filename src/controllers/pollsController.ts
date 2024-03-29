import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Prisma, PrismaClient, Option } from "@prisma/client";
import {
  createPollRequestSchema,
  createVoteParamsSchema,
  viewPollParamsSchema,
} from "../schemas/pollSchemas";

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
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create poll.",
    });
  }
};

export const viewPoll = async (
  req: Request,
  res: Response,
  prismaInstance?: PrismaClient
) => {
  // Only a user with these permissions can view a poll
  const VIEW_POLL_ACCESS_CODE_TYPES = ["admin", "vote", "view"];

  const prisma = prismaInstance || new PrismaClient();

  try {
    const paramsValidation = viewPollParamsSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json(paramsValidation.error);
    }

    const { pollId, accessCode } = req.params;

    const foundPoll = await prisma.poll.findUnique({
      where: { id: Number(pollId) },
      include: { options: { where: { pollId: Number(pollId) } } },
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
    } else if (VIEW_POLL_ACCESS_CODE_TYPES.indexOf(foundAccessCode.type) < 0) {
      return res.status(401).json({
        error: "You do not have permission to perform this action.",
      });
    }

    const pollData = foundPoll;

    res.status(200).json(pollData);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch poll.",
    });
  }
};

// to update
export const createVote = async (
  req: Request,
  res: Response,
  prismaInstance?: PrismaClient
) => {
  // Only a user with these permissions can vote on a poll
  const VOTE_POLL_ACCESS_CODE_TYPES = ["admin", "vote"];

  const prisma = prismaInstance || new PrismaClient();

  try {
    const paramsValidation = createVoteParamsSchema.safeParse(req.params);

    if (!paramsValidation.success) {
      return res.status(400).json(paramsValidation.error);
    }

    const { pollId, accessCode, optionId } = req.params;

    const foundPoll = await prisma.poll.findUnique({
      where: { id: Number(pollId) },
      include: { options: { where: { pollId: Number(pollId) } } },
    });

    if (!foundPoll) {
      return res.status(404).json({ error: "Poll does not exist." });
    }

    const closingDate = new Date(foundPoll.closingAt);
    const currentDate = new Date();
    const isPollOpen = closingDate.getTime() - currentDate.getTime() > 0;

    if (!isPollOpen) {
      return res.status(400).json({
        error: "Bad request",
        message: "This poll has closed.",
      });
    }

    const foundAccessCode = await prisma.accessCode.findUnique({
      where: {
        code: accessCode,
        pollId: Number(pollId),
      },
    });

    if (!foundAccessCode) {
      return res.status(401).json({ error: "Access code not found." });
    } else if (VOTE_POLL_ACCESS_CODE_TYPES.indexOf(foundAccessCode.type) < 0) {
      return res.status(401).json({
        error: "You do not have permission to perform this action.",
      });
    }

    // check if optionId exists for this poll
    const foundOption =
      foundPoll.options.find(
        (pollOption) => Number(optionId) === pollOption.id
      ) || null;

    if (!foundOption) {
      return res.status(401).json({ error: "Option not found." });
    }

    const voteData: Prisma.VoteCreateInput = {
      option: {
        connect: { id: foundOption.id },
      },
      accessCode: {
        connect: { id: foundAccessCode.id },
      },
    };

    const newVote = await prisma.vote.create({
      data: voteData,
    });

    res.status(201).json(newVote);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create vote.",
    });
  }
};
