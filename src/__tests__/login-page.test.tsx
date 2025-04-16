import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../app/(auth)/login/page";
import Header from "@/components/header";
import { useAuth } from "../lib/auth-provider";

const mockUseAuth = useAuth as jest.Mock;

const mockUserAdmin = {
  id: "1",
  email: "testadmin@example.com",
  role: "admin",
};
const mockUserUser = { id: "2", email: "test@example.com", role: "user" };

const mockLogin = jest.fn();
const mockPush = jest.fn();

jest.mock("../lib/auth-provider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      currentUser: undefined,
      logout: jest.fn(),
    });
    mockLogin.mockImplementation((email) =>
      Promise.resolve(
        email === "testadmin@example.com" ? mockUserAdmin : mockUserUser
      )
    );
  });

  it("renders the login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("submits the form with admin credentials", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/documents");
    });

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      currentUser: { id: "1", email: "testadmin@example.com", role: "admin" },
      logout: jest.fn(),
    });

    render(<Header />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("submits the form with user credentials", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/documents");
    });
  });

  it("displays loading state during form submission", async () => {
    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockUserUser), 100);
        })
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      screen.getByRole("button", { name: "Signing in..." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Signing in..." })
    ).toBeDisabled();

    await new Promise((r) => setTimeout(r, 150));

    expect(mockPush).toHaveBeenCalledWith("/documents");
  });

  it("handles login errors appropriately", async () => {
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockLogin).toHaveBeenCalledWith("test@example.com", "wrongpassword");

    await new Promise((r) => setTimeout(r, 50));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
