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
exports.createHocuspocusServer = void 0;
const server_1 = require("@hocuspocus/server");
const extension_logger_1 = require("@hocuspocus/extension-logger");
// 문서별/유저별 연결 카운트 & 삭제 대기 타이머
const connectionsByDoc = new Map();
const pendingDeleteByDoc = new Map();
function getUserIdFromContext(context) {
    var _a, _b, _c, _d;
    const userIdFromContext = (_d = (_c = (_b = (_a = context === null || context === void 0 ? void 0 : context.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : context === null || context === void 0 ? void 0 : context.userId) !== null && _c !== void 0 ? _c : context === null || context === void 0 ? void 0 : context.token) !== null && _d !== void 0 ? _d : context === null || context === void 0 ? void 0 : context.id;
    return userIdFromContext ? String(userIdFromContext) : null;
}
function getDocConnMap(documentName) {
    let m = connectionsByDoc.get(documentName);
    if (!m) {
        m = new Map();
        connectionsByDoc.set(documentName, m);
    }
    return m;
}
function getDocPendingMap(documentName) {
    let m = pendingDeleteByDoc.get(documentName);
    if (!m) {
        m = new Map();
        pendingDeleteByDoc.set(documentName, m);
    }
    return m;
}
function cancelPendingDelete(documentName, userId) {
    const pending = pendingDeleteByDoc.get(documentName);
    const t = pending === null || pending === void 0 ? void 0 : pending.get(userId);
    if (t) {
        clearTimeout(t);
        pending === null || pending === void 0 ? void 0 : pending.delete(userId);
    }
}
// Hocuspocus 서버 생성
const createHocuspocusServer = () => {
    return new server_1.Server({
        name: "SyncVerse Server",
        extensions: [new extension_logger_1.Logger()],
        onAuthenticate(_a) {
            return __awaiter(this, arguments, void 0, function* ({ token, documentName, }) {
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
            });
        },
        onStoreDocument(_a) {
            return __awaiter(this, arguments, void 0, function* ({ document, documentName, }) {
                console.log(`💾 채널 문서 저장 중: ${documentName}`);
                // 데이터베이스 저장 로직
                // await saveToDatabase(documentName, document);
            });
        },
        onLoadDocument(_a) {
            return __awaiter(this, arguments, void 0, function* ({ documentName, }) {
                console.log(`📂 채널 문서 로드 중: ${documentName}`);
                // 데이터베이스 로드 로직
                // const savedDoc = await loadFromDatabase(documentName);
                // if (savedDoc) {
                //   Y.applyUpdate(document, savedDoc);
                // }
            });
        },
        onConnect(_a) {
            return __awaiter(this, arguments, void 0, function* ({ documentName, context, socketId, }) {
                var _b;
                const userId = getUserIdFromContext(context);
                console.log(`👤 클라이언트가 채널에 연결됨: ${documentName} (socketId=${socketId}, userId=${userId !== null && userId !== void 0 ? userId : "unknown"})`);
                if (!userId)
                    return;
                // 연결 카운트 증가 + 삭제 대기 취소
                cancelPendingDelete(documentName, userId);
                const connMap = getDocConnMap(documentName);
                connMap.set(userId, ((_b = connMap.get(userId)) !== null && _b !== void 0 ? _b : 0) + 1);
            });
        },
        onDisconnect(_a) {
            return __awaiter(this, arguments, void 0, function* ({ documentName, document, context, socketId, }) {
                var _b;
                const userId = getUserIdFromContext(context);
                console.log(`👋 클라이언트가 채널에서 연결 해제됨: ${documentName} (socketId=${socketId}, userId=${userId !== null && userId !== void 0 ? userId : "unknown"})`);
                if (!userId)
                    return;
                // 새로고침/재연결 경쟁 조건 방지:
                // 같은 userId가 "여러 소켓"으로 잠깐 공존할 수 있으므로, 마지막 연결이 끊겼을 때만 삭제한다.
                const connMap = getDocConnMap(documentName);
                const prev = (_b = connMap.get(userId)) !== null && _b !== void 0 ? _b : 0;
                const next = Math.max(0, prev - 1);
                if (next === 0)
                    connMap.delete(userId);
                else
                    connMap.set(userId, next);
                if (next > 0)
                    return;
                // 순서가 disconnect -> connect로 뒤바뀌면 깜빡임이 생길 수 있어서, 짧게 지연 후 재확인
                cancelPendingDelete(documentName, userId);
                const pending = getDocPendingMap(documentName);
                const timeout = setTimeout(() => {
                    var _a, _b;
                    const latestConnMap = connectionsByDoc.get(documentName);
                    const stillConnected = ((_a = latestConnMap === null || latestConnMap === void 0 ? void 0 : latestConnMap.get(userId)) !== null && _a !== void 0 ? _a : 0) > 0;
                    if (stillConnected) {
                        // 재연결됨 -> 삭제 취소
                        return;
                    }
                    // Yjs document에서 플레이어 제거 -> 모든 클라이언트에 반영됨
                    try {
                        const playersMap = document.getMap("players");
                        (_b = playersMap === null || playersMap === void 0 ? void 0 : playersMap.delete) === null || _b === void 0 ? void 0 : _b.call(playersMap, userId);
                    }
                    catch (e) {
                        console.error("Failed to remove player on disconnect:", e);
                    }
                    finally {
                        const p = pendingDeleteByDoc.get(documentName);
                        p === null || p === void 0 ? void 0 : p.delete(userId);
                    }
                }, 300);
                pending.set(userId, timeout);
            });
        },
    });
};
exports.createHocuspocusServer = createHocuspocusServer;
