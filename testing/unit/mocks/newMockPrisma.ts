import { PrismaClient } from "@prisma/client";
import { beforeEach } from "@jest/globals";
import { mockDeep, mockReset } from "jest-mock-extended";

beforeEach(() => {
  mockReset(prisma);
});

const prisma = mockDeep<PrismaClient>();
export default prisma;
