import express from "express";
import { getJobs } from "../controllers/jobController.js";

const router = express.Router();

router.get("/jobs", (req, res) => {
  req.query.board = "true";
  return getJobs(req, res);
});

export default router;
