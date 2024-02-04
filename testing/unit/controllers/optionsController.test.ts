import { Request, Response } from "express";
import prisma from "../mocks/newMockPrisma";
import { AccessCode, Poll, Option } from "@prisma/client";
import { createOption } from "../../../src/controllers/optionsController";

describe("createOption", () => {
  it("should create and return an option when called with valid input", async () => {
    const req = {
      body: {
        option: "my poll option",
      },
      params: {
        pollId: "1",
        accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    prisma.poll.findUnique.mockResolvedValue({
      id: Number(req.params.pollId),
    } as unknown as Poll);
    prisma.accessCode.findUnique.mockResolvedValue({
      id: 50,
      code: req.params.accessCode,
      type: "admin",
      pollId: Number(req.params.pollId),
    } as AccessCode);
    prisma.option.create.mockResolvedValue({
      id: 111,
      pollId: Number(req.params.pollId),
      option: req.body.option,
    } as unknown as Option);

    await createOption(req, res, prisma);

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
          code: req.params.accessCode,
          pollId: Number(req.params.pollId),
        },
      })
    );

    expect(prisma.option.create).toHaveBeenCalledTimes(1);
    expect(prisma.option.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          option: req.body.option,
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
        id: 111,
        option: req.body.option,
        pollId: Number(req.params.pollId),
      })
    );
  });

  it("should return a 400 status when called without an access code", async () => {
    const req = {
      body: {
        option: "my poll option",
      },
      params: {
        pollId: "1",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createOption(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(["accessCode"]),
          }),
        ]),
      })
    );
  });

  it("should return a 401 status when the access code is not found", async () => {
    const req = {
      body: {
        option: "my poll option",
      },
      params: {
        pollId: "1",
        accessCode: "084004f4-600e-4097-bd5a-6b146b06fake",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    prisma.poll.findUnique.mockResolvedValue({
      id: Number(req.params.pollId),
    } as unknown as Poll);

    jest.spyOn(prisma.accessCode, "findUnique").mockResolvedValue(null);

    await createOption(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access code not found." });
  });

  it("should return a 400 status when called without a poll ID", async () => {
    const req = {
      body: {
        option: "my poll option",
      },
      params: {
        accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createOption(req, res, prisma);

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
        option: "my poll option",
      },
      params: {
        pollId: "1",
        accessCode: "084004f4-600e-4097-bd5a-6b146b06bb01",
      },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(prisma.poll, "findUnique").mockResolvedValue(null);

    await createOption(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Poll does not exist." });
  });

  it("should return a 400 status when called without an option", async () => {
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

    await createOption(req, res, prisma);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(["option"]),
          }),
        ]),
      })
    );
  });
});
