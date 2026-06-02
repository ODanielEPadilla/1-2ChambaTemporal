import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    career: {
      type: String,
      default: "",
    },

    semester: {
      type: Number,
    },

    companyName: {
      type: String,
      default: "",
    },

    rfc: {
      type: String,
      default: "",
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalJobs: {
      type: Number,
      default: 0,
    },

    verificationDocumentUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;