import { Router } from "express";
import verifyJWT from "../middleware/auth.js";
import authorize from "../middleware/role.js";
import { ADMIN, CANDIDATE, COMPANY } from "../constant.js";
import {
  applyJob,
  getAllApplicants,
  getMyApplications,
  updateApplicationStatus,
  updateResume,
  jobAnalytics,
} from "../controllers/application.controller.js";
import upload from "../middleware/multer.js";

const router = Router();

router.post(
  "/jobs/:jobId/apply",
  verifyJWT,
  authorize([ADMIN, CANDIDATE]),
  upload.single("resume"),
  applyJob
);

router.get(
  "/applications/me",
  verifyJWT,
  authorize([ADMIN, CANDIDATE]),
  getMyApplications
);

router.get(
  "/jobs/:jobId/applications",
  verifyJWT,
  authorize([ADMIN, COMPANY]),
  getAllApplicants
);

router.patch(
  "/applications/:id/status",
  verifyJWT,
  authorize([ADMIN, COMPANY]),
  updateApplicationStatus
);

router.patch(
  "/jobs/:jobId/resume",
  verifyJWT,
  authorize([ADMIN, CANDIDATE]),
  upload.single("resume"),
  updateResume
);

router.get(
  "/analytics/:jobId",
  verifyJWT,
  authorize([ADMIN, COMPANY]),
  jobAnalytics
);

export default router;
