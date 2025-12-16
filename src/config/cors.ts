import cors from "cors";
import { config } from "./index";

export const corsMiddleware = cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
});
