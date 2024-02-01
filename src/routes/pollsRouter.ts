import { Router, Request, Response } from "express";
import { prismaInstance } from "../../prisma/prismaSingleton";
import { createPoll } from "../controllers/pollsController";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  await createPoll(req, res, prismaInstance);
});

export default router;
