import { Router } from "express";
import { createAccessCode, createPoll } from "../controllers/pollsController";

const router = Router();

router.post("/", createPoll);
router.post("/:pollId/createAccessCode", createAccessCode);

export default router;
