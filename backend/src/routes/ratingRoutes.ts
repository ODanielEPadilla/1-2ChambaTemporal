import express from "express";
import {
  createRating,
  getRatingsByUser,
  getRatingsGivenByUser,
  getRatings,
} from "../controllers/ratingController";

const router = express.Router();

router.post("/", createRating);

router.get("/", getRatings);

router.get("/user/:userId", getRatingsByUser);

router.get("/given/:userId", getRatingsGivenByUser);

export default router;