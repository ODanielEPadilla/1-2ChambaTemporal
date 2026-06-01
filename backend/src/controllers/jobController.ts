import { Request, Response } from "express";
import Job from "../models/jobModel";
import User from "../models/userModel";

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
    const jobs = await Job.find().populate("client");

    res.json(jobs);
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

    const job = await Job.findById(jobId).populate("client");

    if (!job) {
      return res.status(404).json({ message: "Trabajo no encontrado" });
    }

    res.json(job);
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