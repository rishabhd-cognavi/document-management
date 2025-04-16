import React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="mb-4 w-full">
      <Label htmlFor={label}>{label}</Label>
      <input
        id={label}
        {...props}
        className={cn(
          "mt-1 block w-full rounded-md border h-10 px-3 py-2 text-sm ring-offset-background",
          error ? "border-red-500" : "border-gray-300",
          "shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",
          className
        )}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
