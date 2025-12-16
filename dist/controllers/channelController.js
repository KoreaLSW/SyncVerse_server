"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChannel = exports.getChannels = void 0;
const getChannels = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 채널 목록 조회 로직
        res.json({ channels: [] });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get channels" });
    }
});
exports.getChannels = getChannels;
const createChannel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        // 채널 생성 로직
        res.json({ channel: { name } });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create channel" });
    }
});
exports.createChannel = createChannel;
