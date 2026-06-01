import { Request, Response } from "express";
import Application from "../models/applicationModel";
import Job from "../models/jobModel";
import User from "../models/userModel";

export const createApplication = async (
  req: Request,
  res: Response
) => {
  try {
    const { job, student } = req.body;

    const existingJob = await Job.findById(job);

    if (!existingJob) {
      return res.status(404).json({
        message: "Trabajo no encontrado",
      });
    }

    const existingStudent = await User.findById(student);

    if (!existingStudent) {
      return res.status(404).json({
        message: "Estudiante no encontrado",
      });
    }

    const existingApplication = await Application.findOne({
      job,
      student,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "Ya te postulaste a este trabajo",
      });
    }

    const newApplication = new Application(req.body);

    await newApplication.save();

    res.status(201).json(newApplication);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al crear la postulacion",
    });
  }
};

export const getApplicationsByJob = async (
  req: Request,
  res: Response
) => {
  try {
    const jobId = req.params.jobId;

    if (!jobId) {
      return res.status(400).json({
        message: "Falta el ID del trabajo",
      });
    }

    const applications = await Application.find({
      job: jobId,
    })
      .populate("student")
      .populate("job");

    res.json(applications);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al obtener postulaciones",
    });
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const applicationId = req.params.applicationId;

    if (!applicationId) {
      return res.status(400).json({
        message: "Falta el ID de la postulación",
      });
    }

    const { status } = req.body;

    const updatedApplication =
      await Application.findByIdAndUpdate(
        applicationId,
        { status },
        { new: true }
      );

    if (!updatedApplication) {
      return res.status(404).json({
        message: "Postulación no encontrada",
      });
    }

    if (status === "aceptada") {
      await Job.findByIdAndUpdate(updatedApplication.job, {
        status: "en_proceso",
      });
    }

    res.json(updatedApplication);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al actualizar postulación",
    });
  }
};

export const getApplicationsByStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const studentId = req.params.studentId;

    if (!studentId) {
      return res.status(400).json({
        message: "Falta el ID del estudiante",
      });
    }

    const applications = await Application.find({
      student: studentId,
    })
      .populate("student")
      .populate({
        path: "job",
        populate: {
          path: "client",
        },
      });

    res.json(applications);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al obtener postulaciones del estudiante",
    });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await Application.find()
      .populate("student")
      .populate({
        path: "job",
        populate: {
          path: "client",
        },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error al obtener postulaciones",
    });
  }
};