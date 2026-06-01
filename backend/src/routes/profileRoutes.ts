import express from "express";
import multer from "multer";
import {
  getMyProfile,
  createOrUpdateProfile,
} from "../controllers/profileController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get("/:userId", getMyProfile);
router.put("/:userId", upload.single("imageFile"), createOrUpdateProfile);

export default router;