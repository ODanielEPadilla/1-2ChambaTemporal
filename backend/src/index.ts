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
import { auth } from "express-oauth2-jwt-bearer";

dotenv.config();

const app = express();

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error("Faltan variables de entorno de Cloudinary");
}

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
});

const auth0Audience = process.env.AUTH0_AUDIENCE;
const auth0IssuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;

if (!auth0Audience || !auth0IssuerBaseUrl) {
  throw new Error(
    "Faltan variables de entorno de Auth0: AUTH0_AUDIENCE o AUTH0_ISSUER_BASE_URL"
  );
}

const jwtCheck = auth({
  audience: auth0Audience,
  issuerBaseURL: auth0IssuerBaseUrl,
  tokenSigningAlg: "RS256",
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/profile", jwtCheck, profileRoutes);
app.use("/api/job", jwtCheck, jobRoutes);
app.use("/api/application", jwtCheck, applicationRoutes);
app.use("/api/rating", jwtCheck, ratingRoutes);

const PORT = process.env.PORT || 3000;

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend de 1/2Chamba funcionando correctamente" });
});

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => {
    console.log("Base de datos conectada");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos");
    console.log(error);
  });