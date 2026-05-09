import { Router } from "express";

export const planRouter = Router();

planRouter.get("/:childId/latest", (req, res) => {
  res.json({
    childId: req.params.childId,
    periodType: "weekly",
    goals: ["Use full sentences", "Practice family topic"],
    focusTopics: ["my-family"]
  });
});
