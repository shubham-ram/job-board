import mongoose from "mongoose";
import { ADMIN } from "../constant.js";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import AppError from "../utils/AppError.js";
import { replaceResume, uploadResume } from "../utils/resumeStorage.js";

async function applyJob(req, res) {
  const jobId = req.params.jobId;
  const userId = req.account._id;
  const fileData = req.file;

  if (!fileData) {
    throw new AppError("Please Upload Resume", 400);
  }

  const existingApplication = await Application.findOne({
    job: jobId,
    user: userId,
  });

  if (existingApplication) {
    throw new AppError("Already applied for this job", 400);
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (job.status !== "open") {
    throw new AppError("This job is not open", 400);
  }

  const result = await uploadResume(fileData);

  const application = await Application.create({
    job: jobId,
    user: userId,
    resumeUrl: result.secure_url,
    resumePublicId: result.public_id,
    resumeOriginalName: fileData.originalname,
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
    .populate("job")
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

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const isOwner = job.createdBy.toString() === account._id.toString();
  const isAdmin = account.role === ADMIN;

  if (!isAdmin && !isOwner) {
    throw new AppError("You dont have access", 403);
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageLimit = Math.min(
    50,
    Math.max(1, Number(req.query.pageLimit)) || 10
  );

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

async function updateApplicationStatus(req, res) {
  const account = req.account;
  const applicationId = req.params.id;
  const applicationStatus = req.body.status;

  if (!applicationStatus) {
    throw new AppError("Missing job status in payload", 400);
  }

  const application = await Application.findById(applicationId).populate("job");

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const job = application.job;

  const isOwner = job.createdBy.toString() === account._id.toString();
  const isAdmin = account.role === ADMIN;

  if (!isAdmin && !isOwner) {
    throw new AppError("You dont have access", 403);
  }

  await Application.updateOne(
    { _id: applicationId },
    {
      status: applicationStatus,
    },
    {
      runValidators: true,
    }
  );

  res.status(200).json({
    message: `updated application status`,
  });
}

async function updateResume(req, res) {
  const userId = req.account._id;
  const jobId = req.params.jobId;
  const fileData = req.file;

  if (!fileData) {
    throw new AppError("Please Upload Resume", 400);
  }

  const existingApplication = await Application.findOne({
    job: jobId,
    user: userId,
  });

  if (!existingApplication) {
    throw new AppError("Application doesnt exist", 404);
  }
  const prevResumeId = existingApplication.resumePublicId;
  const applicationId = existingApplication._id;

  const result = prevResumeId
    ? await replaceResume(fileData, prevResumeId)
    : await uploadResume(fileData);

  await Application.updateOne(
    {
      _id: applicationId,
    },
    {
      resumeUrl: result.secure_url,
      resumePublicId: result.public_id,
      resumeOriginalName: fileData.originalname,
    },
    { runValidators: true }
  );

  res.status(200).json({ message: "updated resume" });
}

async function jobAnalytics(req, res) {
  const jobId = req.params.jobId;
  const account = req.account;

  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError("Job does not exist", 404);
  }

  const isOwner = job.createdBy.toString() === account._id.toString();
  const isAdmin = account.role === ADMIN;

  if (!isAdmin && !isOwner) {
    throw new AppError("You dont have access", 403);
  }

  const [result] = await Application.aggregate([
    {
      $match: { job: new mongoose.Types.ObjectId(jobId) },
    },
    {
      $facet: {
        totalApplicants: [
          {
            $count: "count",
          },
        ],
        statusBreakdown: [
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
            },
          },
        ],
      },
    },
  ]);

  const statusBreakdown = {
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  };

  result.statusBreakdown.forEach((status) => {
    statusBreakdown[status._id] = status.count;
  });

  const output = {
    totalApplicants: result.totalApplicants[0]?.count || 0,
    statusBreakdown,
  };

  res.status(200).json({ data: output });
}

export {
  applyJob,
  getMyApplications,
  getAllApplicants,
  updateApplicationStatus,
  updateResume,
  jobAnalytics,
};
