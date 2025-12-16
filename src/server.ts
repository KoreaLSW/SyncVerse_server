import { createServer } from "http";
import app from "./app";
import { createHocuspocusServer } from "./services/hocuspocusService";
import { config } from "./config";

// Express HTTP 서버 생성
const httpServer = createServer(app);

// Hocuspocus 서버 생성 (자체 HTTP 서버 사용)
const hocuspocusServer = createHocuspocusServer();

// Express 서버 시작
httpServer.listen(config.port, () => {
  console.log(`🚀 Express Server is listening on port ${config.port}`);
});

// Hocuspocus 서버 시작 (별도 포트 또는 같은 포트에서 WebSocket 업그레이드 처리)
// Hocuspocus는 자체 HTTP 서버를 사용하므로, Express와 통합하려면
// WebSocket 업그레이드를 Express 서버에서 처리해야 합니다.
// 현재는 별도 포트에서 실행합니다.
const hocuspocusPort = config.port + 1; // 4001 포트
hocuspocusServer.listen(hocuspocusPort, () => {
  console.log(
    `🔌 Hocuspocus WebSocket server is ready on port ${hocuspocusPort}`
  );
});
