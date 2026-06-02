import { Request, Response } from "express";
import Job from "../models/jobModel";
import User from "../models/userModel";
import { attachClientProfiles } from "../utils/jobEnrichment.js";

export const createJob = async (req: Request, res: Response) => {
  try {
    const { client } = req.body;

    const existingClient = await User.findById(client);

    if (!existingClient) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const newJob = new Job(req.body);
    await newJob.save();

    res.status(201).json(newJob);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear el trabajo" });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const { q, category, modality, location, board } = req.query;
    const conditions: Record<string, unknown>[] = [];

    if (board === "true") {
      conditions.push({ status: "abierto" });
    }

    if (category && typeof category === "string") {
      conditions.push({ category });
    }

    if (modality && typeof modality === "string") {
      conditions.push({ modality });
    }

    if (location && typeof location === "string" && location.trim()) {
      const place = location.trim();
      conditions.push({
        $or: [
          { location: { $regex: place, $options: "i" } },
          { city: { $regex: place, $options: "i" } },
        ],
      });
    }

    if (q && typeof q === "string" && q.trim()) {
      const search = q.trim();
      conditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { skillsRequired: { $elemMatch: { $regex: search, $options: "i" } } },
        ],
      });
    }

    const filter =
      conditions.length > 0 ? { $and: conditions } : {};

    const jobs = await Job.find(filter)
      .populate("client")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedJobs = await attachClientProfiles(jobs);

    res.json(enrichedJobs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los trabajos" });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({ message: "Falta el ID del trabajo" });
    }

    const job = await Job.findById(jobId).populate("client").lean();

    if (!job) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    const [enrichedJob] = await attachClientProfiles([job]);

    res.json(enrichedJob);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener el trabajo" });
  }
};

export const getJobsByClient = async (req: Request, res: Response) => {
  try {
    const clientId = req.params.clientId;

    if (!clientId) {
      return res.status(400).json({
        message: "Falta el ID del cliente",
      });
    }

    const jobs = await Job.find({ client: clientId }).populate("client");

    res.json(jobs);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al obtener los trabajos del cliente",
    });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({
        message: "Falta el ID del trabajo",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      req.body,
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: "Trabajo no encontrado",
      });
    }

    res.json(updatedJob);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al actualizar el trabajo",
    });
  }
};

export const finishJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({
        message: "Falta el ID del trabajo",
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { status: "finalizado" },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: "Trabajo no encontrado",
      });
    }

    res.json(updatedJob);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al finalizar el trabajo",
    });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({
        message: "Falta el ID del trabajo",
      });
    }

    const deletedJob = await Job.findByIdAndDelete(jobId);

    if (!deletedJob) {
      return res.status(404).json({
        message: "Trabajo no encontrado",
      });
    }

    res.json({ message: "Trabajo eliminado correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al eliminar el trabajo",
    });
  }
};