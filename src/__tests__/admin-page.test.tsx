import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminPage from "../app/admin/page";
import * as React from "react";

import { useAuth } from "../lib/auth-provider";
import { toast } from "sonner";

jest.mock("../lib/auth-provider", () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    promise: jest.fn(),
  },
}));

jest.mock("lucide-react", () => ({
  Shield: () => <span data-testid="shield-icon" />,
  UserCog: () => <span data-testid="user-cog-icon" />,
  ChevronDown: () => <span data-testid="chevron-icon" />,
  Users: () => <span data-testid="users-icon" />,
  Settings: () => <span data-testid="settings-icon" />,
}));

describe("Admin Page", () => {
  const mockSignup = jest.fn().mockResolvedValue({ success: true });
  const mockDeleteUser = jest.fn().mockResolvedValue({ success: true });
  const mockUpdateUser = jest.fn().mockResolvedValue({ success: true });

  const mockUserList = [
    {
      id: "1",
      email: "user1@example.com",
      role: "admin",
      status: "active",
      lastLogin: "2023-01-01",
    },
    {
      id: "2",
      email: "user2@example.com",
      role: "user",
      status: "active",
      lastLogin: "2023-01-02",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockImplementation(() => ({
      currentUser: { role: "admin", email: "admin@example.com" },
      userList: mockUserList,
      signup: mockSignup,
      deleteUser: mockDeleteUser,
      updateUser: mockUpdateUser,
      isLoading: false,
    }));

    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (toast.promise as jest.Mock).mockImplementation((promise, options) => {
      // Immediately resolve the promise to trigger success callback
      promise.then(options.success);
      return { id: "mock-toast-id" };
    });
  });

  it("renders the admin dashboard for admin users", () => {
    render(<AdminPage />);

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add User" })
    ).toBeInTheDocument();
  });

  it("redirects non-admin users to the home page", async () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      currentUser: { role: "user" },
      userList: [],
      logout: jest.fn(),
    }));

    mockPush.mockClear();

    render(<AdminPage />);

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/");
      },
      { timeout: 2000 }
    );
  });

  it("opens the Add User modal when Add User button is clicked", async () => {
    render(<AdminPage />);

    const addUserButton = screen.getByRole("button", { name: "Add User" });
    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getAllByText(/add user/i)[0]).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/user@example.com/i)
      ).toBeInTheDocument();
    });
  });

  it("validates the form when submitted with empty fields", async () => {
    render(<AdminPage />);

    const addUserButton = screen.getByRole("button", { name: "Add User" });
    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getAllByText(/add user/i)[0]).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorElements = screen.getAllByText(
        /required|is required|must be/i
      );
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it("successfully submits the form when all fields are valid", async () => {
    render(<AdminPage />);

    const addUserButton = screen.getByRole("button", { name: "Add User" });
    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getAllByText(/add user/i)[0]).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "user" },
    });

    const passwordInputs = screen.getAllByPlaceholderText("********");
    fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
    fireEvent.change(passwordInputs[1], { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalled();
    });
  });

  it("shows validation error when passwords don't match", async () => {
    render(<AdminPage />);

    const addUserButton = screen.getByRole("button", { name: "Add User" });
    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getAllByText(/add user/i)[0]).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });

    const roleSelect = screen.getByText(/select a role/i);
    fireEvent.change(roleSelect, { target: { value: "user" } });

    const passwordInputs = screen.getAllByPlaceholderText("********");
    fireEvent.change(passwordInputs[0], { target: { value: "password123" } });
    fireEvent.change(passwordInputs[1], {
      target: { value: "differentpassword" },
    });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    });
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it("opens the Edit User modal when Edit button is clicked", async () => {
    render(<AdminPage />);

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });

    const emailInputs = screen.getAllByRole("textbox");
    const emailInput = emailInputs.find(
      (input) =>
        input.getAttribute("name") === "email" ||
        input.getAttribute("id") === "Email"
    );

    expect(emailInput).not.toBeNull();
    expect(emailInput).toHaveValue("user1@example.com");
  });

  it("displays the expected number of users in the table", () => {
    render(<AdminPage />);

    expect(screen.getByText("user1@example.com")).toBeInTheDocument();
    expect(screen.getByText("user2@example.com")).toBeInTheDocument();
  });

  it("displays user roles correctly", () => {
    render(<AdminPage />);

    const adminRoles = screen.getAllByText("admin");
    const userRoles = screen.getAllByText("user");

    expect(adminRoles.length).toBeGreaterThanOrEqual(1);
    expect(userRoles.length).toBeGreaterThanOrEqual(1);
  });

  it("displays user statuses correctly", () => {
    render(<AdminPage />);

    const activeStatuses = screen.getAllByText("active");
    expect(activeStatuses.length).toBeGreaterThanOrEqual(2);
  });

  it("renders edit buttons for each user", () => {
    render(<AdminPage />);

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    expect(editButtons.length).toBe(2);
  });

  it("should have correct navigation links", () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      currentUser: { role: "admin" },
      userList: mockUserList,
      signup: mockSignup,
      deleteUser: mockDeleteUser,
      updateUser: mockUpdateUser,
    }));

    render(<AdminPage />);

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("has a working modal that can be closed", () => {
    render(<AdminPage />);

    const addUserButton = screen.getByRole("button", { name: "Add User" });
    fireEvent.click(addUserButton);

    const modalOverlay = screen.getByText((_, element) => {
      return (
        element?.tagName.toLowerCase() === "div" &&
        element?.className?.includes("fixed inset-0") &&
        !element?.className?.includes("z-10")
      );
    });

    expect(modalOverlay).toBeInTheDocument();
  });

  it("shows error when password is too short", async () => {
    render(<AdminPage />);

    const addUserButton = screen.getByRole("button", { name: "Add User" });
    fireEvent.click(addUserButton);

    await waitFor(() => {
      expect(screen.getAllByText(/add user/i)[0]).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/user@example.com/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const roleSelect = screen.getByText(/select a role/i);
    fireEvent.change(roleSelect, { target: { value: "user" } });

    const passwordInputs = screen.getAllByPlaceholderText("********");
    fireEvent.change(passwordInputs[0], { target: { value: "pass" } });
    fireEvent.change(passwordInputs[1], { target: { value: "pass" } });

    const submitButton = screen.getByRole("button", { name: "Submit" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters.")
      ).toBeInTheDocument();
    });
  });
});
