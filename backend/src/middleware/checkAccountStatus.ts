import type { Request, Response, NextFunction } from "express";
import User from "../models/userModel.js";

const BLOCKED_STATUSES = ["pendiente", "suspendido", "rechazado"];

export const checkAccountStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth0Id = req.auth?.payload?.sub;

    if (!auth0Id || typeof auth0Id !== "string") {
      return res.status(401).json({ message: "No autorizado" });
    }

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return next();
    }

    if (
      user.role !== "administrador" &&
      BLOCKED_STATUSES.includes(user.status)
    ) {
      return res.status(403).json({
        message: "Tu cuenta no tiene acceso al sistema",
        status: user.status,
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al validar cuenta" });
  }
};
