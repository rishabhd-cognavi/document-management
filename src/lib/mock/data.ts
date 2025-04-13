import { faker } from "@faker-js/faker";
import { Document, IngestionStatus, QAItem, QAResponse, User } from "../types";

// Generate mock documents
export const generateMockDocuments = (count: number = 10): Document[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(),
    lastModified: faker.date.recent().toISOString(),
    createdBy: faker.internet.email(),
    status: faker.helpers.arrayElement([
      "queued",
      "processing",
      "completed",
      "failed",
    ]),
  })) as Document[];
};

// Generate mock Q&A items
export const generateMockQA = (count: number = 5): QAItem[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    question: faker.lorem.sentence() + "?",
    answer: faker.lorem.paragraph(),
    category: faker.helpers.arrayElement([
      "General",
      "Technical",
      "Billing",
      "Support",
    ]),
    votes: faker.number.int({ min: 0, max: 100 }),
  }));
};

// Generate mock users
export const generateMockUsers = (count: number = 5): User[] => {
  const adminUser: User = {
    id: "1",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    lastLogin: faker.date.recent().toISOString(),
  };

  const regularUsers = Array.from({ length: count - 1 }, () => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    role: "user" as const,
    status: faker.helpers.arrayElement(["active", "inactive"] as const),
    lastLogin: faker.date.recent().toISOString(),
  }));

  return [adminUser, ...regularUsers];
};

// Mock QA Responses
export const mockQAResponse: QAResponse = {
  answer:
    "According to the company handbook, employees are entitled to 20 days of paid vacation per year.",
  confidence: 0.95,
  sourceDocuments: [
    {
      id: "1",
      title: "Company Handbook",
      excerpt:
        "Full-time employees are entitled to 20 days of paid vacation per year, which can be taken after completing the probation period.",
    },
  ],
};

export const generateMockIngestionStatuses = (): IngestionStatus[] => {
  return [];
};
