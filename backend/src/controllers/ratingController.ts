import { Request, Response } from "express";
import Rating from "../models/ratingModel";
import Profile from "../models/profileModel";
import Job from "../models/jobModel";
import User from "../models/userModel";

export const createRating = async (req: Request, res: Response) => {
  try {
    const { job, reviewer, reviewed, score, comment } = req.body;

    const existingRating = await Rating.findOne({
      job,
      reviewer,
      reviewed,
    });

    if (existingRating) {
      return res.status(400).json({
        message: "Ya calificaste este trabajo",
      });
    }

    const newRating = new Rating({
      job,
      reviewer,
      reviewed,
      score,
      comment,
    });

    await newRating.save();

    const ratings = await Rating.find({ reviewed });

    const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
    const averageRating = totalScore / ratings.length;

    await Profile.findOneAndUpdate(
      { user: reviewed },
      {
        averageRating: Number(averageRating.toFixed(1)),
      }
    );

    res.status(201).json(newRating);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al crear calificación",
    });
  }
};

export const getRatingsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    const ratings = await Rating.find({ reviewed: userId })
      .populate("job")
      .populate("reviewer")
      .populate("reviewed");

    res.json(ratings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
};

export const getRatingsGivenByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "Falta el ID del usuario" });
    }

    const ratings = await Rating.find({ reviewer: userId })
      .populate("job")
      .populate("reviewer")
      .populate("reviewed");

    res.json(ratings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener calificaciones dadas" });
  }
};

export const getRatings = async (req: Request, res: Response) => {
  try {
    const ratings = await Rating.find()
      .populate("job")
      .populate("reviewer")
      .populate("reviewed")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al obtener calificaciones",
    });
  }
};