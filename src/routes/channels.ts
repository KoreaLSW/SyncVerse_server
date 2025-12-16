import { Router } from "express";
import { getChannels, createChannel } from "../controllers/channelController";

const router = Router();

router.get("/", getChannels);
router.post("/", createChannel);

export default router;
