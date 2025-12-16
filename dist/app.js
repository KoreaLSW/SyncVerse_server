"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = require("./config/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./middleware/logger");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// 미들웨어
app.use(cors_1.corsMiddleware);
app.use(express_1.default.json());
app.use(logger_1.loggerMiddleware);
// 라우트
app.use("/", routes_1.default);
// 에러 핸들러 (라우트 이후에 위치)
app.use(errorHandler_1.errorHandler);
exports.default = app;
