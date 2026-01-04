import { Server as HocuspocusServer } from "@hocuspocus/server";
import type {
  onAuthenticatePayload,
  onStoreDocumentPayload,
  onLoadDocumentPayload,
  onConnectPayload,
  onDisconnectPayload,
} from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";

// 인증 결과 타입
interface AuthenticationResult {
  user?: {
    id: string | number;
    name?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Hocuspocus 서버 생성
export const createHocuspocusServer = (): HocuspocusServer => {
  return new HocuspocusServer({
    name: "SyncVerse Server",
    //extensions: [new Logger()],

    async onAuthenticate({
      token,
      documentName,
    }: onAuthenticatePayload): Promise<AuthenticationResult> {
      console.log(`🔐 채널 인증 중: ${documentName}`);
      // 토큰 검증 로직
      // if (!token) throw new Error('Unauthorized');

      // 프론트에서 전달한 token(= userId)을 그대로 user.id로 사용
      // token이 없으면 임시 유저로 처리
      const userId = token ? String(token) : `guest_${Date.now()}`;

      return {
        user: {
          id: userId,
          name: "User",
        },
      };
    },

    async onStoreDocument({
      document,
      documentName,
    }: onStoreDocumentPayload): Promise<void> {
      console.log(`💾 채널 문서 저장 중: ${documentName}`);
      // 데이터베이스 저장 로직
      // await saveToDatabase(documentName, document);
    },

    async onLoadDocument({
      documentName,
    }: onLoadDocumentPayload): Promise<void> {
      console.log(`📂 채널 문서 로드 중: ${documentName}`);
      // 데이터베이스 로드 로직
      // const savedDoc = await loadFromDatabase(documentName);
      // if (savedDoc) {
      //   Y.applyUpdate(document, savedDoc);
      // }
    },

    async onConnect({ documentName }: onConnectPayload): Promise<void> {
      console.log(`👤 클라이언트가 채널에 연결됨: ${documentName}`);
    },

    async onDisconnect({
      documentName,
      document,
      context,
      socketId,
    }: onDisconnectPayload): Promise<void> {
      const userIdFromContext =
        context?.user?.id ?? context?.userId ?? context?.token;
      const userId = userIdFromContext ? String(userIdFromContext) : null;

      console.log(
        `👋 클라이언트가 채널에서 연결 해제됨: ${documentName} (socketId=${socketId}, userId=${
          userId ?? "unknown"
        })`
      );

      if (!userId) return;

      // Yjs document에서 플레이어 제거 -> 모든 클라이언트에 반영됨
      try {
        // document는 Y.Doc 호환 객체
        const playersMap = (document as any).getMap("players");
        playersMap?.delete?.(userId);
      } catch (e) {
        console.error("Failed to remove player on disconnect:", e);
      }
    },
  });
};
