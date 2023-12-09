import { Router, Request, Response } from "express";
import { createAccessCode } from "../controllers/accessCodesController";

const router = Router();

router.post("/:pollId", async (req: Request, res: Response) => {
  await createAccessCode(req, res);
});

export default router;
