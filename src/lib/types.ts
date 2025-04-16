export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: string;
  createdBy: string;
  status: "queued" | "processing" | "completed" | "failed";
}

export interface QAItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  votes: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  status: "active" | "inactive";
  lastLogin: string;
}

export interface IngestionStatus {
  id: string;
  documentId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  message?: string;
  createdAt: string;
}

export interface QAResponse {
  answer: string;
  confidence: number;
  sourceDocuments: {
    id: string;
    title: string;
    excerpt: string;
  }[];
}
