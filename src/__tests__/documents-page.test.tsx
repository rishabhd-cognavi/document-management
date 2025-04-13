import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DocumentsPage from "../app/documents/page";

jest.mock("lucide-react", () => ({
  FileText: () => <span data-testid="file-icon" />,
  Loader2: () => <span role="status" />,
  Trash2: () => <span data-testid="trash-icon" />,
}));

jest.mock("date-fns", () => ({
  format: () => "January 1, 2023",
}));

jest.mock("../lib/mock/api", () => ({
  mockAPI: {
    getDocuments: jest.fn(),
    deleteDocument: jest.fn(),
    upload: jest.fn(),
  },
}));

import { mockAPI } from "@/lib/mock/api";

describe("Documents Page", () => {
  const mockDocuments = [
    {
      id: "1",
      title: "Test Document 1",
      content: "This is test content for document 1",
      lastModified: "2023-04-13T10:00:00Z",
      createdBy: "user@example.com",
      status: "completed",
    },
    {
      id: "2",
      title: "Test Document 2",
      content: "This is test content for document 2",
      lastModified: "2023-04-13T11:00:00Z",
      createdBy: "admin@example.com",
      status: "processing",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (mockAPI.getDocuments as jest.Mock).mockResolvedValue([...mockDocuments]);
    (mockAPI.deleteDocument as jest.Mock).mockResolvedValue(undefined);
  });

  it("renders loading state initially", () => {
    (mockAPI.getDocuments as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockDocuments), 100))
    );

    render(<DocumentsPage />);

    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
  });

  it("renders documents after loading", async () => {
    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Document 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Document 2")).toBeInTheDocument();
    expect(
      screen.getByText("This is test content for document 1")
    ).toBeInTheDocument();
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
  });

  it("deletes a document when delete button is clicked", async () => {
    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Document 1")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "" });
    fireEvent.click(deleteButtons[0]);

    expect(mockAPI.deleteDocument).toHaveBeenCalledWith("1");

    (mockAPI.getDocuments as jest.Mock).mockResolvedValue(
      mockDocuments.filter((doc) => doc.id !== "1")
    );

    await waitFor(() => {
      expect(screen.queryByText("Test Document 1")).not.toBeInTheDocument();
    });
  });

  it("uploads a new document", async () => {
    const newDocument = {
      id: "3",
      title: "New Document.pdf",
      content: "New document content",
      lastModified: "2023-04-14T12:00:00Z",
      createdBy: "user@example.com",
      status: "queued",
    };

    (mockAPI.upload as jest.Mock).mockResolvedValue(newDocument);

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    const file = new File(["dummy content"], "New Document.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockAPI.upload).toHaveBeenCalledWith(file);

    await waitFor(() => {
      expect(screen.getByText("New Document.pdf")).toBeInTheDocument();
    });
  });

  it("displays document status correctly", async () => {
    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Document 1")).toBeInTheDocument();
    });

    const statuses = screen.getAllByText(/completed|processing/i);
    expect(statuses).toHaveLength(2);
    expect(statuses[0].textContent).toBe("completed");
    expect(statuses[1].textContent).toBe("processing");
  });

  it("shows empty document list when fetching documents fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (mockAPI.getDocuments as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to fetch")
    );

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch documents:",
        expect.any(Error)
      );
    });

    const documentGrid = screen.getByRole("heading", { name: "Documents" })
      .parentElement?.nextSibling as HTMLElement;
    expect(documentGrid).toBeInTheDocument();
    expect(documentGrid.children.length).toBe(0);

    consoleErrorSpy.mockRestore();
  });

  it("handles error when document deletion fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (mockAPI.deleteDocument as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to delete")
    );

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Document 1")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "" });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to delete document:",
        expect.any(Error)
      );
    });

    expect(screen.getByText("Test Document 1")).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("handles error when document upload fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    (mockAPI.upload as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to upload")
    );

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    const file = new File(["dummy content"], "Failed Upload.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to upload document:",
        expect.any(Error)
      );
    });

    expect(screen.queryByText("Failed Upload.pdf")).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
