import express from "express";
import {
  createCurrentUser,
  updateUserRole,
  getUsers,
  updateUserStatus,
} from "../controllers/userController";

const router = express.Router();

router.post("/", createCurrentUser);

router.get("/", getUsers);

router.put("/:userId/role", updateUserRole);

router.put("/:userId/status", updateUserStatus);

export default router;