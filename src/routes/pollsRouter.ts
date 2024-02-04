import { Router, Request, Response } from "express";
import { prismaInstance } from "../../prisma/prismaSingleton";
import { createPoll, viewPoll } from "../controllers/pollsController";

const router = Router();

router.get(
  "/:pollId/accessCode/:accessCode",
  async (req: Request, res: Response) => {
    await viewPoll(req, res, prismaInstance);
  }
);

router.post("/", async (req: Request, res: Response) => {
  await createPoll(req, res, prismaInstance);
});

export default router;
