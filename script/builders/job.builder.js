import { faker } from "@faker-js/faker";
import { ROLES } from "../fixtures/roles.js";

const LEVEL_PREFIX = {
  Junior: ["Junior", "Associate"],
  "Mid-level": ["", "Mid-Level"],
  Senior: ["Senior", "Staff", "Lead"],
};

const JOB_TYPES = ["Full Time", "Part Time", "Internship", "Contract"];
const EXPERIENCE_LEVELS = ["Junior", "Mid-level", "Senior"];

function buildJob(companyId) {
  const role = faker.helpers.arrayElement(ROLES);
  const experienceLevel = faker.helpers.arrayElement(EXPERIENCE_LEVELS);
  const prefix = faker.helpers.arrayElement(LEVEL_PREFIX[experienceLevel]);

  const title = [prefix, role.title].filter(Boolean).join(" ");
  const skills = faker.helpers.arrayElements(role.skills, { min: 3, max: 6 });

  const salaryMin = faker.number.int({ min: 40_000, max: 120_000 });

  return {
    title,
    description: faker.lorem.paragraphs(2),
    location: `${faker.location.city()}, ${faker.location.country()}`,
    jobType: faker.helpers.arrayElement(JOB_TYPES),
    experienceLevel,
    salaryMin,
    salaryMax: salaryMin + faker.number.int({ min: 15_000, max: 60_000 }),
    skills,
    status: faker.helpers.weightedArrayElement([
      { value: "open", weight: 7 },
      { value: "draft", weight: 2 },
      { value: "closed", weight: 1 },
    ]),
    createdBy: companyId,
  };
}

export default buildJob;
