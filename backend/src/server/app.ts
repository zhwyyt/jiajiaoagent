import express from "express";
import type { AppContainer } from "../bootstrap/container.js";
import { planRouter } from "../routes/planRoutes.js";
import { sessionRouter } from "../routes/sessionRoutes.js";

export function createApp(container: AppContainer) {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "jiajiaoagent-backend"
    });
  });

  app.use("/api/sessions", sessionRouter(container));
  app.use("/api/plans", planRouter);

  return app;
}
