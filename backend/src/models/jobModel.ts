import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "desarrollo web",
        "soporte tecnico",
        "base de datos",
        "diseño de interfaces",
        "otro",
      ],
      required: true,
    },

    modality: {
      type: String,
      enum: ["presencial", "remoto", "hibrido"],
      required: true,
    },

    estimatedDuration: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: "Zacatecas, Zac.",
    },

    city: {
      type: String,
      default: "Zacatecas",
    },

    compensation: {
      type: String,
      default: "A convenir",
    },

    skillsRequired: {
      type: [String],
      default: [],
    },

    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },

    status: {
      type: String,
      enum: ["abierto", "en_proceso", "finalizado", "cancelado"],
      default: "abierto",
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;