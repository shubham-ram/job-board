import "dotenv/config";

import connectDB from "../src/config/db.js";
import { faker } from "@faker-js/faker";
import { createAccount } from "../src/services/account.service.js";
import buildJob from "./builders/job.builder.js";
import buildApplication from "./builders/application.builder.js";
import buildAccountPayload from "./builders/account.builder.js";
import { Account } from "../src/models/account.model.js";
import { Job } from "../src/models/job.model.js";
import { Application } from "../src/models/application.model.js";
import { disconnectDB } from "../src/config/db.js";

async function seedDb() {
  await connectDB();

  // account creation
  for (let i = 0; i < 10; i++) {
    await createAccount(buildAccountPayload({ firstName: `test${i}` }));
  }

  //  job creation
  const companies = await Account.find({
    role: {
      $in: ["company", "admin"],
    },
  }).select("_id");

  const jobs = Array.from({ length: 30 }, () => {
    return buildJob(faker.helpers.arrayElement(companies)._id);
  });

  await Job.insertMany(jobs);

  // application creation
  const candidates = await Account.find({ role: "candidate" }).select("_id");
  const openJobs = await Job.find({ status: "open" }).select("_id");

  console.log("candidates >>", candidates);
  console.log("openJobs >>", openJobs);

  if (!candidates.length || !openJobs.length) {
    console.log("No candidates or open jobs — skipping applications");
    return;
  }

  const applications = [];

  for (const candidate of candidates) {
    const applyCount = faker.helpers.weightedArrayElement([
      { value: 0, weight: 2 },
      { value: 1, weight: 3 },
      { value: 3, weight: 4 },
      { value: 6, weight: 2 },
      { value: 12, weight: 1 },
    ]);

    const pickCount = Math.min(applyCount, openJobs.length);
    if (pickCount === 0) continue;

    const jobsPicked = faker.helpers.arrayElements(openJobs, {
      min: pickCount,
      max: pickCount,
    });

    for (const job of jobsPicked) {
      applications.push(buildApplication(candidate._id, job._id));
    }
  }

  if (applications.length) {
    const result = await Application.insertMany(applications, {
      ordered: false,
      timestamps: false,
    });
    console.log(`Seeded ${result.length} applications`);
  }
}

seedDb()
  .catch((err) => {
    console.log(err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
