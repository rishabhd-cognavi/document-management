import React, { useState } from "react";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth-provider";
import { User } from "@/lib/types";

interface FormData extends Omit<User, "id" | "status" | "lastLogin" | "role"> {
  confirmPassword: string;
  role: User["role"] | "";
}

export default function SignupForm({
  formData,
  setFormData,
  submitButtonName,
  onSubmitClose,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  submitButtonName: string;
  onSubmitClose?: () => void;
}) {
  const { signup } = useAuth();

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

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

  const handleSubmit = () => {
    setLoading(true);
    if (validateForm()) {
      const userCreated = signup({
        email: formData.email,
        password: formData.password,
        role: formData.role as User["role"],
      });

      if (!!userCreated) {
        onSubmitClose?.();
      }
      setFormData({
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
      });
    }
    setLoading(false);
  };

  return (
    <div>
      <form>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="user@example.com"
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
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {submitButtonName}
          </Button>
        </span>
      </form>
    </div>
  );
}
