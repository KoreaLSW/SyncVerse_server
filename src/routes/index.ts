import { Router } from "express";
import healthRoutes from "./health";
import channelRoutes from "./channels";

const router = Router();

router.use("/health", healthRoutes);
router.use("/api/channels", channelRoutes);

// 기본 라우트
router.get("/", (req, res) => {
  res.send("✅ SyncVerse Server is running!");
});

export default router;
