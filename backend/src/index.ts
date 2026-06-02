import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import userRoutes from "./routes/userRoutes";
import profileRoutes from "./routes/profileRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import ratingRoutes from "./routes/ratingRoutes";
import publicRoutes from "./routes/publicRoutes.js";
import { checkAccountStatus } from "./middleware/checkAccountStatus.js";
import { jwtCheck } from "./middleware/jwtCheck.js";

dotenv.config();

const app = express();

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });
} else {
  console.warn(
    "Cloudinary no configurado: las fotos de perfil no se podrán subir"
  );
}

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/public", publicRoutes);

app.use("/api/user", userRoutes);
app.use("/api/profile", jwtCheck, checkAccountStatus, profileRoutes);
app.use("/api/job", jwtCheck, checkAccountStatus, jobRoutes);
app.use("/api/application", jwtCheck, checkAccountStatus, applicationRoutes);
app.use("/api/rating", jwtCheck, checkAccountStatus, ratingRoutes);

const PORT = process.env.PORT || 3000;

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend de 1/2Chamba funcionando correctamente" });
});

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log("Base de datos conectada");

    app.listen(PORT, () => {
      console.log(`Servidor 1/2Chamba corriendo en http://localhost:${PORT}`);
    }).on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `El puerto ${PORT} ya está en uso. Cierra el otro proceso o cambia PORT en .env`
        );
      } else {
        console.error("Error al iniciar el servidor:", error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos");
    console.log(error);
    process.exit(1);
  });