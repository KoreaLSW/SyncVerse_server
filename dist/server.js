"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const hocuspocusService_1 = require("./services/hocuspocusService");
const config_1 = require("./config");
// Express HTTP 서버 생성
const httpServer = (0, http_1.createServer)(app_1.default);
// Hocuspocus 서버 생성 (자체 HTTP 서버 사용)
const hocuspocusServer = (0, hocuspocusService_1.createHocuspocusServer)();
// Express 서버 시작
httpServer.listen(config_1.config.port, () => {
    console.log(`🚀 Express Server is listening on port ${config_1.config.port}`);
});
// Hocuspocus 서버 시작 (별도 포트 또는 같은 포트에서 WebSocket 업그레이드 처리)
// Hocuspocus는 자체 HTTP 서버를 사용하므로, Express와 통합하려면
// WebSocket 업그레이드를 Express 서버에서 처리해야 합니다.
// 현재는 별도 포트에서 실행합니다.
const hocuspocusPort = config_1.config.port + 1; // 4001 포트
hocuspocusServer.listen(hocuspocusPort, () => {
    console.log(`🔌 Hocuspocus WebSocket server is ready on port ${hocuspocusPort}`);
});
