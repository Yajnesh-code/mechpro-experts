import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { routes } from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { rateLimit, sanitizeRequest } from "./middleware/security.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.corsOrigin.split(",").map((item) => item.trim()), credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit);
app.use(sanitizeRequest);
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(`/${env.uploadDir}`, express.static(path.resolve(process.cwd(), env.uploadDir)));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "MechPro Experts API" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.use(routes);
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorMiddleware);
