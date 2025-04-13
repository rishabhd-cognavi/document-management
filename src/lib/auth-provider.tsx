"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  password: string; // Adding password to the User interface
  role: "user" | "admin";
  status: "active" | "inactive";
  lastLogin: string;
}

// No longer need separate AuthUser interface since we've added password to User

interface AuthContextType {
  currentUser: User | undefined;
  userList: User[];
  login: (email: string, password: string) => Promise<User | undefined>;
  signup: (email: string, password: string) => Promise<User | undefined>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users for authentication
const defaultUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin",
    role: "admin",
    status: "active",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user",
    role: "user",
    status: "active",
    lastLogin: new Date().toISOString(),
  },
];

// Mock authentication service
const mockAuth = {
  // Store for registered users (initially contains default users)
  users: [...defaultUsers],

  login: async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user by email and check password
    const user = mockAuth.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Update last login time
    user.lastLogin = new Date().toISOString();
    return { ...user };
  },

  signup: async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user already exists
    if (mockAuth.users.some((u) => u.email === email)) {
      throw new Error("User with this email already exists");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Create new user
    const newUser: User = {
      id: String(mockAuth.users.length + 1),
      email,
      password,
      role: "user",
      status: "active",
      lastLogin: new Date().toISOString(),
    };

    // Add to users collection
    mockAuth.users.push(newUser);
    return { ...newUser };
  },

  getAllUsers: (): User[] => {
    return [...mockAuth.users];
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [userList, setUserList] = useState<User[]>([...mockAuth.users]);

  // Load user from local storage on initial render
  // This will only run once when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const user = await mockAuth.login(email, password);
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      // Update the user list since login time changed
      setUserList([...mockAuth.users]);
      toast.success(`Welcome back, ${user.email}`);
      return user;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      return undefined;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const user = await mockAuth.signup(email, password);
      setUserList([...mockAuth.users]);
      toast.success("Account created successfully");
      return user;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      return undefined;
    }
  };

  const logout = () => {
    setCurrentUser(undefined);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, userList, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
