"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue>({
  isOpen: false,
  setIsOpen: () => {},
});

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  const { setIsOpen } = React.useContext(TooltipContext);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      {...props}>
      {children}
    </div>
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(TooltipContext);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}>
      {children}
    </div>
  );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent };
