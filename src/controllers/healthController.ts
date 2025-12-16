import { Request, Response } from "express";

export const getHealth = (req: Request, res: Response) => {
  console.log("Health check requested!@");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};
