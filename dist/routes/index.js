"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_1 = __importDefault(require("./health"));
const channels_1 = __importDefault(require("./channels"));
const router = (0, express_1.Router)();
router.use("/health", health_1.default);
router.use("/api/channels", channels_1.default);
// 기본 라우트
router.get("/", (req, res) => {
    res.send("✅ SyncVerse Server is running!");
});
exports.default = router;
