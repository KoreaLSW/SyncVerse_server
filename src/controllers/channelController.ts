import { Request, Response } from "express";

export const getChannels = async (req: Request, res: Response) => {
  try {
    // 채널 목록 조회 로직
    res.json({ channels: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to get channels" });
  }
};

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    // 채널 생성 로직
    res.json({ channel: { name } });
  } catch (error) {
    res.status(500).json({ error: "Failed to create channel" });
  }
};
