import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import prisma from "../mocks/newMockPrisma";
import { mockedPrismaClient, mockPrismaWithError } from "../mocks/mockPrisma";
import { Poll, AccessCode, Vote } from "@prisma/client";
import {
  createPoll,
  createVote,
  viewPoll,
} from "../../../src/controllers/pollsController";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

describe("Polls controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("createPoll", () => {
    it("should create and return a poll when called with valid input", async () => {
      const closingDate = new Date(
        new Date().setDate(new Date().getDate() + 5)
      ).toISOString();

      const req = {
        body: {
          title: "Thunder Client test with over 30 characters",
          description: "Still testing with new app",
          maxVotesPerOption: 1,
          maxVotesPerAccessCode: 1,
          closingAt: closingDate,
          // closingAt: "2099-01-31T23:59:59.000Z",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createPoll(req, res, mockedPrismaClient);

      expect(mockedPrismaClient.poll.create).toHaveBeenCalledTimes(1);
      expect(mockedPrismaClient.poll.create).toHaveBeenCalledWith({
        data: {
          title: "Thunder Client test with over 30 characters",
          description: "Still testing with new app",
          maxVotesPerOption: 1,
          maxVotesPerAccessCode: 1,
          closingAt: closingDate,
          accessCodes: { create: { type: "admin", code: expect.any(String) } },
        },
        include: { accessCodes: { where: { type: "admin" } } },
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return an error with status code 400 when called with the appropriate missing fields", async () => {
      const closingDate = new Date(
        new Date().setDate(new Date().getDate() + 5)
      ).toISOString();

      const req = {
        body: {
          title: "Thunder Client test with over 30 characters",
          description: "Still testing with new app",
          // maxVotesPerOption removed
          // maxVotesPerAccessCode removed
          closingAt: closingDate,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createPoll(req, res, mockedPrismaClient);

      expect(mockedPrismaClient.poll.create).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          issues: expect.arrayContaining([
            expect.objectContaining({
              path: expect.arrayContaining(["maxVotesPerOption"]),
            }),
          ]),
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          issues: expect.arrayContaining([
            expect.objectContaining({
              path: expect.arrayContaining(["maxVotesPerAccessCode"]),
            }),
          ]),
        })
      );
    });

    it("should return an error with status code 400 when the closingAt date is in the past", async () => {
      const req = {
        body: {
          title: "Thunder Client test with over 30 characters",
          description: "Still testing with new app",
          maxVotesPerOption: 1,
          maxVotesPerAccessCode: 1,
          closingAt: "2000-01-01T23:59:59.000Z",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createPoll(req, res, mockedPrismaClient);

      expect(mockedPrismaClient.poll.create).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          issues: expect.arrayContaining([
            expect.objectContaining({
              path: expect.arrayContaining(["closingAt"]),
            }),
          ]),
        })
      );
    });

    it("should return an error with status code 500 if there is a database error", async () => {
      const mockedPrismaWithError = mockPrismaWithError();
      const closingDate = new Date(
        new Date().setDate(new Date().getDate() + 5)
      ).toISOString();

      const req = {
        body: {
          title: "Thunder Client test with over 30 characters",
          description: "Still testing with new app",
          maxVotesPerOption: 1,
          maxVotesPerAccessCode: 1,
          closingAt: closingDate,
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createPoll(req, res, mockedPrismaWithError);

      expect(mockedPrismaWithError.poll.create).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Internal server error",
          message: "Failed to create poll.",
        })
      );
    });
  });

  describe("viewPoll", () => {
    it("should return a poll and its options when called with valid input", async () => {
      const mockedViewPollData = {
        id: 1,
        title: "Thunder Client test",
        description: "Still testing",
        maxVotesPerOption: 1,
        maxVotesPerAccessCode: 1,
        closingAt: "2024-01-31T23:59:59.000Z",
        createdAt: "2023-11-13T19:26:31.875Z",
        updatedAt: "2023-11-13T19:26:31.875Z",
        options: [
          {
            id: 1,
            pollId: 1,
            option: "test option",
            createdAt: "2024-02-04T12:14:21.146Z",
            updatedAt: "2024-02-04T12:14:21.146Z",
          },
          {
            id: 2,
            pollId: 1,
            option: "t",
            createdAt: "2024-02-04T12:14:51.314Z",
            updatedAt: "2024-02-04T12:14:51.314Z",
          },
          {
            id: 3,
            pollId: 1,
            option: "test",
            createdAt: "2024-02-04T12:15:27.708Z",
            updatedAt: "2024-02-04T12:15:27.708Z",
          },
        ],
      };

      const req = {
        body: {},
        params: {
          pollId: "1",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      prisma.poll.findUnique.mockResolvedValue(
        mockedViewPollData as unknown as Poll
      );
      prisma.accessCode.findUnique.mockResolvedValue({
        id: 50,
        code: req.params.accessCode,
        type: "admin",
        pollId: Number(req.params.pollId),
      } as AccessCode);

      await viewPoll(req, res, prisma);

      expect(prisma.poll.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.poll.findUnique).toHaveBeenCalledWith({
        where: { id: Number(req.params.pollId) },
        include: { options: { where: { pollId: Number(req.params.pollId) } } },
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockedViewPollData,
        })
      );
    });

    it("should return an error with status code 400 when called with an invalid poll ID", async () => {
      const req = {
        body: {},
        params: {
          pollId: "a",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await viewPoll(req, res, prisma);

      expect(prisma.poll.findUnique).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return an error with status code 400 when called with an invalid access code", async () => {
      const req = {
        body: {},
        params: {
          pollId: "1",
          accessCode: "084004f4-600e-4097-bd5a-fake",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await viewPoll(req, res, prisma);

      expect(prisma.poll.findUnique).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return an error with status code 404 when the poll ID does not exist", async () => {
      const req = {
        body: {},
        params: {
          pollId: "9999",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01fake",
        },
      } as unknown as Request;

      prisma.poll.findUnique.mockResolvedValue(null);

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await viewPoll(req, res, prisma);

      expect(prisma.poll.findUnique).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return an error with status code 500 if there is a database error", async () => {
      const mockedPrismaWithError = mockPrismaWithError();

      const req = {
        body: {},
        params: {
          pollId: "1",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await viewPoll(req, res, mockedPrismaWithError);

      expect(mockedPrismaWithError.poll.findUnique).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Internal server error",
          message: "Failed to fetch poll.",
        })
      );
    });
  });

  describe("createVote", () => {
    it("should create and return a vote when called with valid input", async () => {
      const req = {
        params: {
          pollId: "1",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
          optionId: "3",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      prisma.poll.findUnique.mockResolvedValue({
        id: Number(req.params.pollId),
        closingAt: "2300-01-01T23:59:59.000Z",
        options: [{ id: Number(req.params.optionId) }],
      } as unknown as Poll);
      prisma.accessCode.findUnique.mockResolvedValue({
        id: 50,
        code: req.params.accessCode,
        type: "vote",
        pollId: Number(req.params.pollId),
      } as AccessCode);
      prisma.vote.create.mockResolvedValue({
        id: 100,
        optionId: Number(req.params.optionId),
        accessCodeId: 999,
        createdAt: "2024-02-07T23:26:41.535Z",
        updatedAt: "2024-02-07T23:26:41.535Z",
      } as unknown as Vote);

      await createVote(req, res, prisma);

      expect(prisma.vote.create).toHaveBeenCalledTimes(1);
      expect(prisma.vote.create).toHaveBeenCalledWith({
        data: {
          option: {
            connect: {
              id: Number(req.params.optionId),
            },
          },
          accessCode: {
            connect: {
              id: 50,
            },
          },
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 100,
        optionId: Number(req.params.optionId),
        accessCodeId: 999,
        createdAt: "2024-02-07T23:26:41.535Z",
        updatedAt: "2024-02-07T23:26:41.535Z",
      });
    });

    it("should return an error with status code 400 when called with the appropriate missing fields", async () => {
      const req = {
        params: {
          pollId: "incorrectPollId",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
          optionId: "3",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      prisma.poll.findUnique.mockResolvedValue({
        id: Number(req.params.pollId),
        options: [{ id: Number(req.params.optionId) }],
      } as unknown as Poll);
      prisma.accessCode.findUnique.mockResolvedValue({
        id: 50,
        code: req.params.accessCode,
        type: "vote",
        pollId: Number(req.params.pollId),
      } as AccessCode);
      prisma.vote.create.mockResolvedValue({
        id: 100,
        optionId: Number(req.params.optionId),
        accessCodeId: 999,
        createdAt: "2024-02-07T23:26:41.535Z",
        updatedAt: "2024-02-07T23:26:41.535Z",
      } as unknown as Vote);

      await createVote(req, res, prisma);

      expect(prisma.vote.create).toHaveBeenCalledTimes(0);

      expect(res.status).toHaveBeenCalledWith(400);
      // TODO check for error in res.json
    });

    it("should return an error with status code 400 when the closingAt date is in the past", async () => {
      const req = {
        params: {
          pollId: "1",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
          optionId: "3",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      prisma.poll.findUnique.mockResolvedValue({
        id: Number(req.params.pollId),
        closingAt: "2000-01-01T23:59:59.000Z",
      } as unknown as Poll);

      await createVote(req, res, prisma);

      expect(prisma.poll.create).toHaveBeenCalledTimes(0);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Bad request",
          message: "This poll has closed.",
        })
      );
    });

    it("should return an error with status code 500 if there is a database error", async () => {
      const req = {
        params: {
          pollId: "1",
          accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
          optionId: "3",
        },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      prisma.poll.findUnique.mockRejectedValue(
        new PrismaClientKnownRequestError("There was an error", {
          code: "SOME_ERROR_CODE",
          clientVersion: "1.0.0",
          meta: {},
          batchRequestIdx: 0,
        })
      );

      await createVote(req, res, prisma);

      expect(prisma.poll.findUnique).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Internal server error",
          message: "Failed to create vote.",
        })
      );
    });
  });
});
