import { faker } from "@faker-js/faker";

const STATUS_WEIGHTS = [
  { value: "pending", weight: 10 },
  { value: "reviewed", weight: 4 },
  { value: "shortlisted", weight: 2 },
  { value: "rejected", weight: 3 },
  { value: "hired", weight: 1 },
];

function buildApplication(candidateId, jobId) {
  return {
    user: candidateId,
    job: jobId,
    status: faker.helpers.weightedArrayElement(STATUS_WEIGHTS),
    createdAt: faker.date.recent({ days: 45 }),
    updatedAt: faker.date.recent({ days: 45 }),
  };
}

export default buildApplication;
