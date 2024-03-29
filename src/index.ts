import express from "express";
import cors from "cors";
import { NODE_ENV, PORT } from "../config";

import pollsRouter from "./routes/pollsRouter";
import accessCodesRouter from "./routes/accessCodesRouter";
import optionsRouter from "./routes/optionsRouter";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/polls", pollsRouter);
app.use("/api/accessCodes", accessCodesRouter);
app.use("/api/options", optionsRouter);

app.listen(PORT, () => {
  console.log(`Server running\nEnvironment: ${NODE_ENV}\nPort: ${PORT}`);
});
