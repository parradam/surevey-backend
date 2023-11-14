import express from "express";
import cors from "cors";
import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const PORT = 8000;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/test", async (req: Request, res: Response) => {
  res.json({ message: "success" });
});

app.post("/api/polls", async (req: Request, res: Response) => {
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
});

app.post(
  "/api/polls/:pollId/createAccessCode",
  async (req: Request, res: Response) => {
    const { pollId } = req.params;
    const { code, type } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ error: "Bad request: missing access code." });
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
        error:
          "Unauthorized: you do not have permission to perform this action.",
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
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
