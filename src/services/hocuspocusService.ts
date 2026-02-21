import { Server as HocuspocusServer } from "@hocuspocus/server";
import type {
  onAuthenticatePayload,
  onStoreDocumentPayload,
  onLoadDocumentPayload,
  onConnectPayload,
  onDisconnectPayload,
} from "@hocuspocus/server";
import * as Y from "yjs";
import {
  canUseWhiteboardPersistence,
  loadWhiteboardDocument,
  saveWhiteboardDocument,
} from "./whiteboardPersistence";

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
  const shouldPersistDocument = (documentName: string) =>
    documentName.startsWith("whiteboard-");

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
      if (!shouldPersistDocument(documentName)) return;

      if (!canUseWhiteboardPersistence()) {
        console.warn(
          "⚠️ Supabase 환경변수가 없어 화이트보드 문서 영속화를 건너뜁니다.",
        );
        return;
      }

      try {
        await saveWhiteboardDocument(documentName, document as Y.Doc);
      } catch (error) {
        console.error(`❌ 문서 저장 실패: ${documentName}`, error);
      }
    },

    async onLoadDocument({
      documentName,
      document,
    }: onLoadDocumentPayload): Promise<void> {
      console.log(`📂 채널 문서 로드 중: ${documentName}`);
      if (!shouldPersistDocument(documentName)) return;

      if (!canUseWhiteboardPersistence()) {
        console.warn(
          "⚠️ Supabase 환경변수가 없어 화이트보드 문서 복원을 건너뜁니다.",
        );
        return;
      }

      try {
        const savedState = await loadWhiteboardDocument(documentName);
        if (savedState) {
          Y.applyUpdate(document as Y.Doc, savedState);
          console.log(`✅ 문서 복원 완료: ${documentName}`);
        }
      } catch (error) {
        console.error(`❌ 문서 로드 실패: ${documentName}`, error);
      }
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
        })`,
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
