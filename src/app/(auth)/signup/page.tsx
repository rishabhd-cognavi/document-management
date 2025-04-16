"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { useAuth } from "@/lib/auth-provider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SignupForm from "@/components/signupForm";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    role: "" as "" | "admin" | "user",
    password: "",
    confirmPassword: "",
  });
  // const [loading, setLoading] = useState(false);
  // const { signup } = useAuth();
  const router = useRouter();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const user = await signup(email, password);

  //   if (user) router.push("/login");

  //   setLoading(false);
  // };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Sign up to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form> */}
          <SignupForm
            formData={formData}
            setFormData={setFormData}
            submitButtonName={"Create account"}
            onSubmitClose={() => router.push("/login")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
