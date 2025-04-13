import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QAPage from "../app/qa/page";
import { ReactNode } from "react";

// Mock Lucide React icons - only include icons used in the component
jest.mock("lucide-react", () => ({
  Brain: () => <span data-testid="brain-icon" />,
  FileText: () => <span data-testid="file-icon" />,
  Loader2: () => <span role="status" />,
  ChevronDown: () => <span data-testid="chevron-down" />,
  Search: () => <span data-testid="search-icon" />,
}));

// Mock the Accordion component with a simplified implementation
jest.mock("../components/ui/accordion", () => ({
  AccordionItem: ({
    trigger,
    children,
  }: {
    trigger: ReactNode;
    children: ReactNode;
  }) => (
    <div data-testid="accordion-item">
      <div data-testid="accordion-trigger">{trigger}</div>
      <div data-testid="accordion-content">{children}</div>
    </div>
  ),
}));

// Mock the API with minimum required functions
jest.mock("../lib/mock/api", () => ({
  mockAPI: {
    getQAItems: jest.fn(),
    ask: jest.fn(),
  },
}));

// Import after mocking
import { mockAPI } from "../lib/mock/api";

describe("QA Page", () => {
  const mockQAItems = [
    {
      id: "1",
      question: "What is document management?",
      answer:
        "Document management is the process of storing, organizing, and tracking electronic documents.",
      category: "General",
      votes: 10,
    },
    {
      id: "2",
      question: "How do I upload a document?",
      answer:
        "Navigate to the Documents page and click on the Upload Document button.",
      category: "Technical",
      votes: 5,
    },
  ];

  const mockQAResponse = {
    answer: "This is a test answer to your question.",
    confidence: 0.95,
    sourceDocuments: [
      {
        id: "1",
        title: "Test Document",
        excerpt: "This is an excerpt from the source document.",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockAPI.getQAItems as jest.Mock).mockResolvedValue(mockQAItems);
    (mockAPI.ask as jest.Mock).mockResolvedValue(mockQAResponse);
  });

  it("renders the ask question form", () => {
    render(<QAPage />);
    expect(screen.getByText("Ask a Question")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type your question here...")
    ).toBeInTheDocument();
    expect(screen.getByText("Ask")).toBeInTheDocument();
  });

  it("renders FAQ items after loading", async () => {
    render(<QAPage />);

    await waitFor(() => {
      expect(
        screen.getByText("What is document management?")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("How do I upload a document?")).toBeInTheDocument();
  });

  it("allows asking a question and displays the answer", async () => {
    render(<QAPage />);

    const questionInput = screen.getByPlaceholderText(
      "Type your question here..."
    );
    fireEvent.change(questionInput, { target: { value: "How does AI work?" } });

    const askButton = screen.getByText("Ask");
    fireEvent.click(askButton);

    expect(screen.getByText("Thinking...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("This is a test answer to your question.")
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Test Document")).toBeInTheDocument();
    expect(
      screen.getByText("This is an excerpt from the source document.")
    ).toBeInTheDocument();

    expect(mockAPI.ask).toHaveBeenCalledWith("How does AI work?");
  });

  it("handles API errors when asking questions", async () => {
    (mockAPI.ask as jest.Mock).mockRejectedValue(
      new Error("Failed to get answer")
    );
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(<QAPage />);

    const questionInput = screen.getByPlaceholderText(
      "Type your question here..."
    );
    fireEvent.change(questionInput, { target: { value: "Bad question" } });

    const askButton = screen.getByText("Ask");
    fireEvent.click(askButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Failed to get answer:",
        expect.any(Error)
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Ask")).toBeInTheDocument();
    });
  });
});
