import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import Profile from "../models/profileModel";
import User from "../models/userModel";

const uploadImage = async (file: Express.Multer.File) => {
  const image = file.buffer.toString("base64");
  const dataURI = `data:${file.mimetype};base64,${image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataURI, {
    folder: "1-2chamba/perfiles",
  });

  return uploadResponse.url;
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    const profile = await Profile.findOne({ user: userId }).populate("user");

    if (!profile) {
      return res.status(404).json({ message: "Perfil no encontrado" });
    }

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
};

export const createOrUpdateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let parsedSkills: string[] = [];

    if (req.body.skills) {
      parsedSkills = JSON.parse(req.body.skills);
    }

    const profileData = {
      ...req.body,
      skills: parsedSkills,
      semester: Number(req.body.semester),
      user: userId,
    };

    if (req.file) {
      const imageUrl = await uploadImage(req.file);
      profileData.imageUrl = imageUrl;
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      profileData,
      { new: true, upsert: true }
    ).populate("user");

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al guardar el perfil" });
  }
};