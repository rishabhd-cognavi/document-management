"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User } from "./types";

// No longer need separate AuthUser interface since we've added password to User

interface AuthContextType {
  currentUser: User | undefined;
  userList: User[];
  login: (email: string, password: string) => Promise<User | undefined>;
  signup: (
    user: Omit<User, "id" | "lastLogin" | "status">
  ) => Promise<User | undefined>;
  updateUser: (updatedUser: Omit<User, "lastLogin">) => Promise<User>;
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockAuth.users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    user.lastLogin = new Date().toISOString();
    return { ...user };
  },

  signup: async (
    user: Omit<User, "id" | "lastLogin" | "status">
  ): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mockAuth.users.some((u) => u.email === user.email)) {
      throw new Error("User with this email already exists");
    }

    if (user.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const newUser: User = {
      id: String(mockAuth.users.length + 1),
      ...user,
      status: "active",
      lastLogin: new Date().toISOString(),
    };

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

      setUserList([...mockAuth.users]);
      toast.success(`Welcome back, ${user.email}`);
      return user;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      return undefined;
    }
  };

  const signup = async (data: Omit<User, "id" | "lastLogin" | "status">) => {
    try {
      const user = await mockAuth.signup(data);
      setUserList([...mockAuth.users]);
      toast.success("Account created successfully");
      return user;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      return undefined;
    }
  };

  const updateUser = async (
    updatedUser: Omit<User, "lastLogin">
  ): Promise<User> => {
    console.log("Updating user:", updatedUser);

    try {
      const userIndex = mockAuth.users.findIndex(
        (user) => user.id === updatedUser.id
      );
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const updatedUserData = {
        ...updatedUser,
        lastLogin: mockAuth.users[userIndex].lastLogin,
      };

      mockAuth.users[userIndex] = updatedUserData;
      setUserList([...mockAuth.users]);
      toast.success("User updated successfully");
      return updatedUserData;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(undefined);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, userList, login, signup, updateUser, logout }}>
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
