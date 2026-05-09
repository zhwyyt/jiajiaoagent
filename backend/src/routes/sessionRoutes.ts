import { Router } from "express";
import type { AppContainer } from "../bootstrap/container.js";
import {
  buildStartSessionResponse,
  buildTurnResponse
} from "../services/sessionService.js";
import type { StartSessionRequest, TurnRequest } from "../types/session.js";

export function sessionRouter(container: AppContainer) {
  const router = Router();

  router.post("/start", async (req, res, next) => {
    try {
      const body = req.body as StartSessionRequest;
      const response = await buildStartSessionResponse(body, container);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post("/turn", async (req, res, next) => {
    try {
      const body = req.body as TurnRequest;
      const response = await buildTurnResponse(body, container);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
