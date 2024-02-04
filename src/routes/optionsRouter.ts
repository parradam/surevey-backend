import { Router, Request, Response } from "express";
import { prismaInstance } from "../../prisma/prismaSingleton";
import { createOption } from "../controllers/optionsController";

const router = Router();

router.post(
  "/poll/:pollId/accessCode/:accessCode",
  async (req: Request, res: Response) => {
    console.log("router");
    await createOption(req, res, prismaInstance);
  }
);

export default router;
