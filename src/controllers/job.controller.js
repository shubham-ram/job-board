import { ADMIN } from "../constant.js";
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
  const {
    title,
    experienceLevel,
    skills = [],
    salaryMin,
    salaryMax,
  } = req.query;

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageLimit = Math.min(
    50,
    Math.max(1, Number(req.query.pageLimit) || 10)
  );

  let skillsArray;

  if (Array.isArray(skills)) {
    skillsArray = skills;
  } else if (skills) {
    skillsArray = [skills];
  } else {
    skillsArray = [];
  }

  const offset = (page - 1) * pageLimit;

  const query = {
    ...(title && { $text: { $search: title } }),
    ...(experienceLevel && { experienceLevel: { $eq: experienceLevel } }),
    ...(skillsArray?.length > 0 && { skills: { $in: skillsArray } }),
    ...(salaryMin && { salaryMax: { $gte: Number(salaryMin) } }),
    ...(salaryMax && { salaryMin: { $lte: Number(salaryMax) } }),
  };

  const jobs = await Job.find(query)
    .lean()
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(Number(pageLimit))
    .populate("createdBy");

  return res.status(200).json({ page, pageLimit, data: jobs });
}

async function getJob(req, res) {
  const jobId = req.params.id;

  if (!jobId) {
    throw new AppError("Missing JobId", 404);
  }

  const job = await Job.findById(jobId).populate("createdBy");

  if (!job) {
    throw new AppError("No job found", 404);
  }

  return res.status(200).json(job);
}

async function updateJob(req, res) {
  const jobId = req.params.id;
  const account = req.account;

  if (!jobId) {
    throw new AppError("Job ID is required", 400);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError(`No job found with id: ${jobId}`, 404);
  }

  const isOwner = job.createdBy.toString() === account._id.toString();
  const isAdmin = account.role === ADMIN;

  if (!isAdmin && !isOwner) {
    throw new AppError("You dont have access", 403);
  }

  const { title, description, location, jobType, experienceLevel, status } =
    req.body;

  if (
    !title &&
    !description &&
    !location &&
    !jobType &&
    !experienceLevel &&
    !status
  ) {
    throw new AppError("Provide at least one field to update", 400);
  }

  const payload = {
    ...(title && { title }),
    ...(description && { description }),
    ...(location && { location }),
    ...(jobType && { jobType }),
    ...(experienceLevel && { experienceLevel }),
    ...(status && { status }),
  };

  await Job.updateOne({ _id: jobId }, payload, {
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: `updated job with ${jobId} id`,
  });
}

async function deleteJob(req, res) {
  const jobId = req.params.id;
  const account = req.account;

  if (!jobId) {
    throw new AppError("Missing Job id", 400);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError(`No job found with id: ${jobId}`, 404);
  }

  const isOwner = job.createdBy.toString() === account._id.toString();
  const isAdmin = account.role === ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError("You dont have access", 403);
  }

  await Job.deleteOne({ _id: jobId });

  res.status(200).json({ message: `Job delete with id: ${jobId}` });
}

export { createJob, getJob, getJobs, updateJob, deleteJob };
