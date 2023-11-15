import { Router, Request, Response } from "express";
import { createAccessCode, createPoll } from "../controllers/pollsController";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  await createPoll(req, res);
});
router.post("/:pollId/createAccessCode", createAccessCode);

export default router;
