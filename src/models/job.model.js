import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ["Full Time", "Part Time", "Internship", "Contract"],
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ["Junior", "Mid-level", "Senior"],
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    skills: [{ type: String }],
    status: {
      type: String,
      required: true,
      enum: ["open", "closed", "draft"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", jobSchema);
