import express from "express";
import { corsMiddleware } from "./config/cors";
import { errorHandler } from "./middleware/errorHandler";
import { loggerMiddleware } from "./middleware/logger";
import routes from "./routes";

const app = express();

// 미들웨어
app.use(corsMiddleware);
app.use(express.json());
app.use(loggerMiddleware);

// 라우트
app.use("/", routes);

// 에러 핸들러 (라우트 이후에 위치)
app.use(errorHandler);

export default app;
