import { ADMIN } from "../constant.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import AppError from "../utils/AppError.js";

async function applyJob(req, res) {
  const jobId = req.params.jobId;
  const userId = req.account._id;

  const existingApplication = await Application.find({
    job: jobId,
    user: userId,
  });

  if (existingApplication) {
    throw new AppError("Already applied for this job", 400);
  }

  const application = await Application.create({
    job: jobId,
    user: userId,
  });

  return res.status(201).json(application);
}

async function getMyApplications(req, res) {
  const userId = req.account._id;

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageLimit = Math.min(
    50,
    Math.max(1, Number(req.query.pageLimit) || 10)
  );

  const offset = (page - 1) * pageLimit;
  const query = {
    user: userId,
  };

  const applications = await Application.find(query)
    .lean()
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(pageLimit);

  return res.status(200).json({
    page,
    pageLimit,
    data: applications,
  });
}

async function getAllApplicants(req, res) {
  const jobId = req.params.jobId;
  const account = req.account;

  const job = await Job.findById(jobId);

  const isOwner = job.createdBy.toString() === account._id.toString();
  const isAdmin = account.role === ADMIN;

  if (!isAdmin || !isOwner) {
    throw new AppError("You dont have access", 403);
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageLimit = Math.min(50, Number(req.query.pageLimit) || 10);

  const query = { job: jobId };
  const offset = (page - 1) * pageLimit;

  const applicants = await Application.find(query)
    .populate("user")
    .lean()
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(pageLimit);

  return res.status(200).json({ page, pageLimit, data: applicants });
}

async function updateJobStatus(req, res) {
  const account = req.account;
  const jobId = req.params.jobId;

  const applicationId = req.body.id;

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const job = await Job.findById(jobId);

  const isOwner = job.createdBy.toString === account._id.toString();
  const isAdmin = account.role === ADMIN;

  if (!isAdmin || !isOwner) {
    throw new AppError("You dont have access", 403);
  }

  await Application.updateOne(
    { _id: applicationId },
    {
      status: req.body.status,
    }
  );

  res.status(200).json({
    message: `updated application status`,
  });
}

export { applyJob, getMyApplications, getAllApplicants, updateJobStatus };
