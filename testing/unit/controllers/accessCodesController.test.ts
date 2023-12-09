import { Request, Response } from "express";
import prisma from "../mocks/newMockPrisma";
import { createAccessCode } from "../../../src/controllers/accessCodesController";
import { AccessCode } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// invalid access code
// no access code
// no type
// DB error

describe("createAccessCode", () => {
  it("should create and return an access code when called with valid input", async () => {
    const req = {
      body: {
        code: "084004f4-600e-4097-bd5a-6b146b06bb01",
        type: "view",
      },
      params: {
        pollId: "1",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    prisma.poll.findUnique.mockResolvedValue({
      ...req.body,
      id: Number(req.params.pollId),
    });
    prisma.accessCode.findUnique.mockResolvedValue({
      id: 50,
      code: req.body.code,
      type: "admin",
      pollId: Number(req.params.pollId),
    } as AccessCode);
    prisma.accessCode.create.mockResolvedValue({
      id: 99,
      type: req.body.type,
      code: "084004f4-600e-4097-bd5a-6b146b06bb99",
      pollId: Number(req.params.pollId),
    } as unknown as AccessCode);

    await createAccessCode(req, res, prisma);

    expect(prisma.poll.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.poll.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: Number(req.params.pollId),
        },
      })
    );

    expect(prisma.accessCode.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.accessCode.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          code: req.body.code,
          pollId: Number(req.params.pollId),
        },
      })
    );

    expect(prisma.accessCode.create).toHaveBeenCalledTimes(1);
    expect(prisma.accessCode.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          type: req.body.type,
          code: expect.any(String),
          poll: {
            connect: {
              id: Number(req.params.pollId),
            },
          },
        },
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 99,
        type: req.body.type,
        code: "084004f4-600e-4097-bd5a-6b146b06bb99",
        pollId: Number(req.params.pollId),
      })
    );
  });

  it("should return a 400 status when called without an access code", async () => {
    const req = {
      body: {
        // code: "084004f4-600e-4097-bd5a-6b146b06bb01", // removed
        type: "view",
      },
      params: {
        pollId: "1",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createAccessCode(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(["code"]),
          }),
        ]),
      })
    );
  });

  it("should return a 401 status when the access code is not found", async () => {
    const req = {
      body: {
        code: "084004f4-600e-4097-bd5a-6b146b06fake",
        type: "view",
      },
      params: {
        pollId: "1",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    prisma.poll.findUnique.mockResolvedValue({
      ...req.body,
      id: Number(req.params.pollId),
    });

    jest.spyOn(prisma.accessCode, "findUnique").mockResolvedValue(null);

    await createAccessCode(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access code not found." });
  });

  it("should return a 400 status when called without a poll ID", async () => {
    const req = {
      body: {
        code: "084004f4-600e-4097-bd5a-6b146b06bb01",
        type: "view",
      },
      params: {},
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    prisma.poll.findUnique.mockResolvedValue({
      ...req.body,
      id: req.params.pollId,
    });

    await createAccessCode(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(["pollId"]),
          }),
        ]),
      })
    );
  });

  it("should return a 404 status when the poll ID does not exist", async () => {
    const req = {
      body: {
        code: "084004f4-600e-4097-bd5a-6b146b06bb01",
        type: "view",
      },
      params: {
        pollId: "1",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(prisma.poll, "findUnique").mockResolvedValue(null);

    await createAccessCode(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Poll does not exist." });
  });
});
