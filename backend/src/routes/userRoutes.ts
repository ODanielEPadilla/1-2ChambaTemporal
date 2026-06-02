import express from "express";
import {
  createCurrentUser,
  updateUserRole,
  getUsers,
  updateUserStatus,
} from "../controllers/userController";
import { jwtCheck } from "../middleware/jwtCheck.js";

const router = express.Router();

router.post("/", createCurrentUser);

router.get("/", jwtCheck, getUsers);

router.put("/:userId/role", jwtCheck, updateUserRole);

router.put("/:userId/status", jwtCheck, updateUserStatus);

export default router;