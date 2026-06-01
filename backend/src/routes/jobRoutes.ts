import express from "express";
import {
  createJob,
  getJobs,
  getJobsByClient,
  updateJob,
  finishJob,
  deleteJob,
} from "../controllers/jobController";

const router = express.Router();

router.post("/", createJob);

router.get("/", getJobs);

router.get("/client/:clientId", getJobsByClient);

router.put("/:jobId", updateJob);

router.put("/:jobId/finalize", finishJob);

router.delete("/:jobId", deleteJob);

export default router;