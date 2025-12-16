"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const channelController_1 = require("../controllers/channelController");
const router = (0, express_1.Router)();
router.get("/", channelController_1.getChannels);
router.post("/", channelController_1.createChannel);
exports.default = router;
