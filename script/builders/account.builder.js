import { faker } from "@faker-js/faker";

const ROLE_WEIGHTS = [
  { value: "candidate", weight: 10 },
  { value: "company", weight: 5 },
  { value: "admin", weight: 1 },
];

function buildAccountPayload(overrides = {}) {
  const firstName = overrides.firstName ?? faker.person.firstName();

  return {
    name: faker.person.fullName({ firstName }),
    email: faker.internet.email({ firstName }),
    password: "Pass@123",
    role: faker.helpers.weightedArrayElement(ROLE_WEIGHTS),
    ...overrides,
  };
}

export default buildAccountPayload;
