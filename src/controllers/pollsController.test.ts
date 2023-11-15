import { jest, describe, it, expect } from "@jest/globals";
import { Request, Response } from "express";
import { createPoll } from "./pollsController";
import { PrismaClient } from "@prisma/client";

const mockPrisma = {
  poll: {
    create: jest.fn(),
  },
};

describe("Polls controller", () => {
  it("should create a poll when called with valid input", async () => {
    const req = {
      body: {
        title: "Thunder Client test",
        description: "Still testing with new app",
        maxVotesPerOption: 3,
        maxVotesPerAccessCode: 1,
        closingAt: "2024-01-31T23:59:59.000Z",
      },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createPoll(req, res, mockPrisma as unknown as PrismaClient);

    expect(mockPrisma.poll.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.poll.create).toHaveBeenCalledWith({
      data: {
        title: "Thunder Client test",
        description: "Still testing with new app",
        maxVotesPerOption: 3,
        maxVotesPerAccessCode: 1,
        closingAt: "2024-01-31T23:59:59.000Z",
        accessCodes: { create: { type: "admin", code: expect.any(String) } },
      },
      include: { accessCodes: { where: { type: "admin" } } },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
