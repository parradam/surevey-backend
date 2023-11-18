import { Router, Request, Response } from "express";
import { createPoll } from "../controllers/pollsController";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  await createPoll(req, res);
});

export default router;
