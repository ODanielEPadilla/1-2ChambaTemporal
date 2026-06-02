import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
    enum: ["estudiante", "cliente", "administrador"],
    default: "estudiante",
  },
  status: {
    type: String,
    enum: ["activo", "pendiente", "suspendido", "rechazado"],
    default: "activo",
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  controlNumber: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;