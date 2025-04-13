import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import SignupPage from "../app/(auth)/signup/page";
import { useAuth } from "../lib/auth-provider";
import { useRouter } from "next/navigation";

jest.mock("../lib/auth-provider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Signup Page", () => {
  const mockSignup = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ signup: mockSignup });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders the signup form correctly", () => {
    render(<SignupPage />);

    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Choose a password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" })
    ).toBeInTheDocument();
  });

  it("submits the form with user credentials", async () => {
    mockSignup.mockResolvedValue({ id: "123", email: "newuser@example.com" });

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Choose a password"), {
      target: { value: "newpassword123" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    });

    expect(mockSignup).toHaveBeenCalledWith(
      "newuser@example.com",
      "newpassword123"
    );

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("displays loading state during form submission", async () => {
    let resolveSignup: (value: unknown) => void;
    const signupPromise = new Promise((resolve) => {
      resolveSignup = resolve;
    });

    mockSignup.mockImplementation(() => signupPromise);

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Choose a password"), {
      target: { value: "newpassword123" },
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Creating account..." })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Creating account..." })
    ).toBeDisabled();

    await act(async () => {
      resolveSignup!({ id: "123", email: "newuser@example.com" });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("handles signup errors appropriately", async () => {
    mockSignup.mockResolvedValue(undefined);

    render(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Choose a password"), {
      target: { value: "short" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    });

    expect(mockSignup).toHaveBeenCalledWith("newuser@example.com", "short");
    expect(mockPush).not.toHaveBeenCalled();

    expect(
      screen.getByRole("button", { name: "Create account" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" })
    ).not.toBeDisabled();
  });
});
