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
router.put(
  "/:userId",
  upload.fields([
    { name: "imageFile", maxCount: 1 },
    { name: "verificationFile", maxCount: 1 },
  ]),
  createOrUpdateProfile
);

export default router;