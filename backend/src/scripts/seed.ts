import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import Profile from "../models/profileModel.js";
import Job from "../models/jobModel.js";

dotenv.config();

type JobCategory =
  | "desarrollo web"
  | "soporte tecnico"
  | "base de datos"
  | "diseño de interfaces"
  | "otro";

type JobModality = "remoto" | "presencial" | "hibrido";

type SeedJob = {
  title: string;
  description: string;
  category: JobCategory;
  modality: JobModality;
  estimatedDuration: string;
  location: string;
  city: string;
  compensation: string;
  skillsRequired: string[];
};

const clients = [
  {
    auth0Id: "seed|cliente-techzac",
    email: "contacto@techzac.mx",
    name: "TechZac Solutions",
    companyName: "TechZac Solutions",
    description:
      "Empresa de desarrollo de software en Zacatecas especializada en soluciones web y soporte TI.",
  },
  {
    auth0Id: "seed|cliente-digital-norte",
    email: "hr@digitalnorte.com",
    name: "Digital Norte",
    companyName: "Digital Norte",
    description:
      "Agencia digital que conecta negocios locales con talento tecnológico joven.",
  },
  {
    auth0Id: "seed|cliente-innovaitz",
    email: "vacantes@innovaitz.mx",
    name: "Innova ITZ",
    companyName: "Innova ITZ",
    description:
      "Consultora tecnológica con proyectos para el sector educativo y comercial.",
  },
];

const jobsByClient: SeedJob[][] = [
  [
    {
      title: "Desarrollador web frontend (React)",
      description:
        "Buscamos estudiante para apoyar en el desarrollo de interfaces con React y TypeScript. Trabajo de medio tiempo, ideal para semestres 5 en adelante.",
      category: "desarrollo web",
      modality: "remoto",
      estimatedDuration: "2 meses",
      location: "Zacatecas, Zac.",
      city: "Zacatecas",
      compensation: "$4,500 / mes",
      skillsRequired: ["React", "TypeScript", "CSS"],
    },
    {
      title: "Soporte técnico presencial",
      description:
        "Apoyo en mantenimiento de equipos, redes básicas y atención a usuarios en oficina. Horario flexible por la tarde.",
      category: "soporte tecnico",
      modality: "presencial",
      estimatedDuration: "1 mes",
      location: "Centro, Zacatecas",
      city: "Zacatecas",
      compensation: "$3,200 / mes",
      skillsRequired: ["Windows", "Redes", "Office"],
    },
  ],
  [
    {
      title: "Administrador de base de datos MySQL",
      description:
        "Tareas de respaldo, consultas y optimización básica de bases de datos para proyecto escolar-comercial.",
      category: "base de datos",
      modality: "hibrido",
      estimatedDuration: "6 semanas",
      location: "Guadalupe, Zac.",
      city: "Guadalupe",
      compensation: "$3,800 / mes",
      skillsRequired: ["MySQL", "SQL", "MongoDB"],
    },
    {
      title: "Diseñador UI para app móvil web",
      description:
        "Creación de wireframes y prototipos en Figma para aplicación de servicios locales.",
      category: "diseño de interfaces",
      modality: "remoto",
      estimatedDuration: "3 semanas",
      location: "Zacatecas, Zac.",
      city: "Zacatecas",
      compensation: "A convenir",
      skillsRequired: ["Figma", "UI", "UX"],
    },
    {
      title: "Practicante en marketing digital",
      description:
        "Apoyo en redes sociales y contenido para campañas de reclutamiento de talento joven.",
      category: "otro",
      modality: "remoto",
      estimatedDuration: "1 mes",
      location: "Remoto",
      city: "Zacatecas",
      compensation: "$2,800 / mes",
      skillsRequired: ["Canva", "Redes sociales"],
    },
  ],
  [
    {
      title: "Backend Node.js para API REST",
      description:
        "Desarrollo de endpoints y documentación para plataforma interna de gestión de proyectos.",
      category: "desarrollo web",
      modality: "remoto",
      estimatedDuration: "2 meses",
      location: "Zacatecas, Zac.",
      city: "Zacatecas",
      compensation: "$5,000 / mes",
      skillsRequired: ["Node.js", "Express", "MongoDB"],
    },
    {
      title: "Técnico en instalación de CCTV",
      description:
        "Apoyo en configuración de cámaras y red local para cliente comercial. Se requiere disponibilidad fines de semana.",
      category: "soporte tecnico",
      modality: "presencial",
      estimatedDuration: "3 semanas",
      location: "Fresnillo, Zac.",
      city: "Fresnillo",
      compensation: "$350 / día",
      skillsRequired: ["Redes", "Hardware"],
    },
    {
      title: "Landing page para evento universitario",
      description:
        "Maquetación responsive y despliegue en hosting para evento del ITZ.",
      category: "desarrollo web",
      modality: "hibrido",
      estimatedDuration: "2 semanas",
      location: "Campus ITZ, Zacatecas",
      city: "Zacatecas",
      compensation: "$2,500 proyecto",
      skillsRequired: ["HTML", "CSS", "JavaScript"],
    },
  ],
];

async function seed() {
  const connectionString = process.env.MONGODB_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error("Falta MONGODB_CONNECTION_STRING en .env");
  }

  await mongoose.connect(connectionString);
  console.log("Conectado a MongoDB");

  let jobsCreated = 0;

  for (const [index, clientData] of clients.entries()) {
    const clientJobs = jobsByClient[index] ?? [];

    let user = await User.findOne({ email: clientData.email });

    if (!user) {
      user = await User.create({
        auth0Id: clientData.auth0Id,
        email: clientData.email,
        name: clientData.name,
        role: "cliente",
        status: "activo",
        onboardingCompleted: true,
      });
      console.log(`Usuario creado: ${user.name}`);
    } else {
      await User.findByIdAndUpdate(user._id, {
        status: "activo",
        onboardingCompleted: true,
        role: "cliente",
      });
      console.log(`Usuario existente: ${user.name}`);
    }

    await Profile.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        companyName: clientData.companyName,
        description: clientData.description,
        averageRating: 4.2 + index * 0.2,
        totalJobs: clientJobs.length,
      },
      { upsert: true, new: true }
    );

    for (const jobData of clientJobs) {
      const exists = await Job.findOne({
        title: jobData.title,
        client: user._id,
      });

      if (exists) {
        console.log(`  · Trabajo ya existe: ${jobData.title}`);
        continue;
      }

      await Job.create({
        ...jobData,
        client: user._id,
        status: "abierto",
        vacancies: 1,
      });

      jobsCreated++;
      console.log(`  + Trabajo: ${jobData.title}`);
    }
  }

  console.log(`\nSeed completado: ${jobsCreated} empleos nuevos creados.`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error("Error en seed:", error);
  process.exit(1);
});
