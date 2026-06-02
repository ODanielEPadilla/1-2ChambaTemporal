import { Request, Response } from "express";
import User from "../models/userModel.js";

export const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;

    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { role, controlNumber } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    if (!["estudiante", "cliente", "administrador"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (role === "estudiante") {
      const institutionalEmail = /@(itz|tec)\.edu\.mx$/i.test(
        existingUser.email
      );

      if (!institutionalEmail) {
        return res.status(400).json({
          message:
            "El registro de estudiante requiere un correo institucional @itz.edu.mx",
        });
      }

      if (!controlNumber || String(controlNumber).trim().length < 8) {
        return res.status(400).json({
          message: "Debes ingresar un número de control válido del ITZ",
        });
      }
    }

    const status = role === "cliente" ? "pendiente" : "activo";

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        role,
        status,
        onboardingCompleted: true,
        controlNumber: role === "estudiante" ? String(controlNumber).trim() : "",
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al actualizar el rol" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al obtener usuarios",
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { status } = req.body;

    if (!["activo", "pendiente", "suspendido", "rechazado"].includes(status)) {
      return res.status(400).json({
        message: "Estado inválido",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al actualizar estado",
    });
  }
};