import express from "express";
import {
  createApplication,
  getApplications,
  getApplicationsByJob,
  getApplicationsByStudent,
  updateApplicationStatus,
} from "../controllers/applicationController";
const router = express.Router();

router.post("/", createApplication);

router.get("/", getApplications);

router.get("/job/:jobId", getApplicationsByJob);

router.get("/student/:studentId", getApplicationsByStudent);

router.put(
  "/:applicationId/status",
  updateApplicationStatus
);

export default router;