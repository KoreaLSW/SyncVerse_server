"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const index_1 = require("./index");
exports.corsMiddleware = (0, cors_1.default)({
    origin: index_1.config.cors.origin,
    credentials: index_1.config.cors.credentials,
});
