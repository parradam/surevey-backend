import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Request, Response } from "express";
import { mockedPrismaClient, mockPrismaWithError } from "../mocks/mockPrisma";
import { createPoll } from "../../../src/controllers/pollsController";

describe("Polls controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should create and return a poll when called with valid input", async () => {
    const req = {
      body: {
        title: "Thunder Client test with over 30 characters",
        description: "Still testing with new app",
        maxVotesPerOption: 1,
        maxVotesPerAccessCode: 1,
        closingAt: "2024-01-31T23:59:59.000Z",
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
        closingAt: "2024-01-31T23:59:59.000Z",
        accessCodes: { create: { type: "admin", code: expect.any(String) } },
      },
      include: { accessCodes: { where: { type: "admin" } } },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return an error with status code 400 when called with the appropriate missing fields", async () => {
    const req = {
      body: {
        title: "Thunder Client test with over 30 characters",
        description: "Still testing with new app",
        // maxVotesPerOption removed
        // maxVotesPerAccessCode removed
        closingAt: "2024-01-31T23:59:59.000Z",
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

    const req = {
      body: {
        title: "Thunder Client test with over 30 characters",
        description: "Still testing with new app",
        maxVotesPerOption: 1,
        maxVotesPerAccessCode: 1,
        closingAt: "2024-01-31T23:59:59.000Z",
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
