import { jest } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const mockedPrismaClient = {
  poll: {
    create: jest.fn(),
  },
} as unknown as PrismaClient;

export const mockPrismaWithError = () => {
  const prisma = new PrismaClient();

  jest.spyOn(prisma.poll, "create").mockRejectedValue(
    new PrismaClientKnownRequestError("There was an error", {
      code: "SOME_ERROR_CODE",
      clientVersion: "1.0.0",
      meta: {},
      batchRequestIdx: 0,
    })
  );

  jest.spyOn(prisma.poll, "findUnique").mockRejectedValue(
    new PrismaClientKnownRequestError("There was an error", {
      code: "SOME_ERROR_CODE",
      clientVersion: "1.0.0",
      meta: {},
      batchRequestIdx: 0,
    })
  );

  return prisma;
};
