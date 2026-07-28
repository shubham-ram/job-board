import { Router } from "express";
import verifyJWT from "../middleware/auth.js";
import authorize from "../middleware/role.js";
import { ADMIN, CANDIDATE, COMPANY } from "../constant.js";
import {
  applyJob,
  getAllApplicants,
  getMyApplications,
  updateJobStatus,
} from "../controllers/application.controller.js";

const router = Router();

router.post(
  "/jobs/:jobId/apply",
  verifyJWT,
  authorize([ADMIN, CANDIDATE]),
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
  authorize([ADMIN, COMPANY], getAllApplicants)
);

router.post(
  "/applications/:id/status",
  verifyJWT,
  authorize([ADMIN, COMPANY]),
  updateJobStatus
);
