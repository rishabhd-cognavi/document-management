import { ChevronDown } from "lucide-react";
import React from "react";
import { Label } from "./label";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  ...props
}) => {
  return (
    <div className="mb-4">
      <Label htmlFor={label}>{label}</Label>
      <div className="relative">
        <select
          {...props}
          className={`mt-1 block w-full rounded-md border h-10 px-3 py-2 appearance-none placeholder-gray-700 ${
            error ? "border-red-500" : "border-gray-300"
          } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pr-10`}>
          <option value="">Select a role</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronDown />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
