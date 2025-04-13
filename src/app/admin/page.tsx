"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-provider";
import { useRouter } from "next/navigation";
import { Shield, UserCog } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "inactive";
  lastLogin: string;
}

export default function AdminPage() {
  const { userList, currentUser, signup } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [editMode, setEditMode] = useState(false); // Track if the modal is in edit mode
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // Track the user being edited

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors: typeof errors = {
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.role) newErrors.role = "Role is required.";
    if (!formData.password) newErrors.password = "Password is required.";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const openEditModal = (user: User) => {
    setEditMode(true);
    setSelectedUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (editMode && selectedUser) {
        toast.success("User updated successfully!");
      } else {
        toast.success("User added successfully!");
      }
      signup(formData.email, formData.password);
      setIsModalOpen(false);
      setFormData({ email: "", role: "", password: "", confirmPassword: "" });
      setSelectedUser(null);
      setEditMode(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and system settings
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserCog className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditMode(false);
                  setSelectedUser(null);
                  setFormData({
                    email: "",
                    role: "",
                    password: "",
                    confirmPassword: "",
                  });
                  setIsModalOpen(true);
                }}>
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "destructive" : "secondary"
                        }>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "secondary"
                        }>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(user)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? "Edit User" : "Add User"}>
        <form>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="user @example.com"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
          />
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            options={[
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ]}
            error={errors.role}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="********"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="********"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={errors.confirmPassword}
          />
          <span className="inline-flex items-center justify-end w-full gap-2">
            <Button type="button" onClick={handleSubmit}>
              {editMode ? "Update" : "Submit"}
            </Button>
          </span>
        </form>
      </Modal>
    </div>
  );
}
