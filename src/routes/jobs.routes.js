import { Router } from "express";
import verifyJWT from "../middleware/auth.js";
import authorize from "../middleware/role.js";
import { ADMIN, COMPANY } from "../constant.js";
import {
  createJob,
  deleteJob,
  getJob,
  getJobs,
  updateJob,
} from "../controllers/job.controller.js";

const router = Router();

router.post("/", verifyJWT, authorize([ADMIN, COMPANY]), createJob);

router.get("/", getJobs);

router.get("/:id", getJob);

router.patch("/:id", verifyJWT, authorize([ADMIN, COMPANY]), updateJob);

router.delete("/:id", verifyJWT, authorize([ADMIN, COMPANY]), deleteJob);

export default router;
