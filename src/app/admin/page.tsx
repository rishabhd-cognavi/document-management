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
import SignupForm from "@/components/signupForm";
import UserUpdateForm from "@/components/userUpdateForm";
import { User } from "@/lib/types";
import { format } from "date-fns";

interface selectedUserType extends Omit<User, "lastLogin" | "role"> {
  confirmPassword: string;
  role: User["role"] | "";
}

export default function AdminPage() {
  const { userList, currentUser } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    selectedUserType | undefined
  >(undefined);
  const [formData, setFormData] = useState({
    email: "",
    role: "" as "" | "admin" | "user",
    password: "",
    confirmPassword: "",
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/");
    }
  }, [currentUser, router]);

  const openEditModal = (user: User) => {
    setEditMode(true);
    setSelectedUser({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
      confirmPassword: "",
    });

    setIsModalOpen(true);
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
                    <TableCell>
                      {format(user.lastLogin, "dd-MM-yyyy")}
                    </TableCell>
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
        {editMode ? (
          <UserUpdateForm
            formData={selectedUser as selectedUserType}
            setFormData={setSelectedUser}
            submitButtonName="Update"
            onSubmitClose={() => {
              setIsModalOpen(false);
              setFormData({
                email: "",
                role: "",
                password: "",
                confirmPassword: "",
              });
              setEditMode(false);
            }}
          />
        ) : (
          <SignupForm
            formData={formData}
            setFormData={setFormData}
            submitButtonName={"Submit"}
            onSubmitClose={() => {
              setIsModalOpen(false);
              setFormData({
                email: "",
                role: "",
                password: "",
                confirmPassword: "",
              });
              setEditMode(false);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
