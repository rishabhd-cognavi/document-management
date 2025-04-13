import { faker } from "@faker-js/faker";
import { Document, IngestionStatus, QAItem, QAResponse, User } from "../types";
import {
  generateMockDocuments,
  generateMockQA,
  generateMockUsers,
  mockQAResponse,
} from "./data";
import { toast } from "sonner";

// Simulate API delay
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock API class
export class MockAPI {
  private documents: Document[] = generateMockDocuments();
  private qaItems: QAItem[] = generateMockQA();
  private users: User[] = generateMockUsers();
  private ingestionStatuses: IngestionStatus[] = []; // Add missing ingestionStatuses array

  // Document operations
  async getDocuments(): Promise<Document[]> {
    await delay();
    return this.documents;
  }

  async getDocument(id: string): Promise<Document | null> {
    await delay();
    return this.documents.find((doc) => doc.id === id) || null;
  }

  async upload(file: File): Promise<Document> {
    const newDoc: Document = {
      id: String(this.documents.length + 1),
      title: file.name,
      content: faker.lorem.paragraphs(),
      lastModified: new Date().toISOString(),
      createdBy: "current-user@example.com",
      status: "queued",
    };
    this.documents.push(newDoc);
    toast.success("Document uploaded successfully!");
    return newDoc;
  }

  async deleteDocument(id: string): Promise<void> {
    const index = this.documents.findIndex((doc) => doc.id === id);
    if (index !== -1) {
      this.documents.splice(index, 1);
      toast.success("Document deleted successfully!");
    } else {
      throw new Error(`Document with id ${id} not found`);
    }
  }

  // Q&A operations
  async getQAItems(): Promise<QAItem[]> {
    await delay();
    return this.qaItems;
  }

  async getUsers(): Promise<User[]> {
    await delay();
    return this.users;
  }

  async ask(question: string): Promise<QAResponse> {
    return {
      ...mockQAResponse,
      answer: `Here's a response to your question: "${question}"\n\n${mockQAResponse.answer}`,
    };
  }
}

// Create a singleton instance
export const mockAPI = new MockAPI();
