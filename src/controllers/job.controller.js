import { Job } from "../models/job.model.js";
import AppError from "../utils/AppError.js";

async function createJob(req, res) {
  const { title, description, location, jobType, experienceLevel } = req.body;

  if (!title || !description || !location || !jobType || !experienceLevel) {
    throw new AppError("Missing few parameters", 400);
  }

  const accountId = req.account._id;

  const payload = {
    title,
    description,
    location,
    jobType,
    experienceLevel,
    salaryMin: req.body?.salaryMin,
    salaryMax: req.body?.salaryMax,
    skills: req.body?.skills,
    status: req.body?.status,
    createdBy: accountId,
  };

  const job = await Job.create(payload);

  return res.status(201).json(job);
}

async function getJobs(req, res) {
  const { pageLimit = 10, title, experienceLevel, skills = [] } = req.query;

  const page = Math.max(1, Number(req.query.page) || 1);

  const offset = (page - 1) * pageLimit;

  const query = {
    ...(title && { title: { $regex: title } }),
    ...(experienceLevel && { experienceLevel: { $eq: experienceLevel } }),
    ...(skills.length > 0 && { skills: { $in: skills } }),
  };

  const jobs = await Job.find(query)
    .lean()
    .skip(offset)
    .limit(Number(pageLimit));

  return res.status(200).json({ page, pageLimit, jobs });
}

async function getJob(req, res) {
  const jobId = req.params.id;

  if (!jobId) {
    throw new AppError("Missing JobId", 404);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("No job found", 404);
  }

  return res.status(200).json(job);
}

async function updateJob(req, res) {
  const jobId = req.params.id;

  if (!jobId) {
    throw new AppError("Missing JobId", 404);
  }

  const { title, description, location, jobType, experienceLevel } = req.body;

  if (!title && !description && !location && !jobType && !experienceLevel) {
    throw new AppError("Missing few parameters", 400);
  }

  const payload = {
    ...(title && { title }),
    ...(description && { description }),
    ...(location && { location }),
    ...(jobType && { jobType }),
    ...(experienceLevel && { experienceLevel }),
  };

  const updatedJob = await Job.findByIdAndUpdate(jobId, payload, {
    runValidators: true,
    new: true,
  });

  if (!updatedJob) {
    throw new AppError(`No job found with id: ${jobId}`, 404);
  }

  res.status(200).json({ message: `update job with ${jobId} id` });
}

async function deleteJob(req, res) {
  const jobId = req.params.id;

  if (!jobId) {
    throw new AppError("Missing Job id", 400);
  }

  const deletedJob = await Job.findByIdAndDelete(jobId);

  if (!deletedJob) {
    throw new AppError(`No job found with id: ${jobId}`, 404);
  }

  res.status(200).json({ message: `Job delete with id: ${jobId}` });
}

export { createJob, getJob, getJobs, updateJob, deleteJob };
