"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  AccordionItemProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, trigger, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={ref} className={cn("border-b", className)} {...props}>
      <div className="flex">
        <button
          type="button"
          onClick={toggleOpen}
          className={cn(
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
          )}>
          {trigger}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </div>
      <div
        style={{ height }}
        className={cn(
          "overflow-hidden transition-[height] duration-300 ease-out"
        )}>
        <div
          ref={contentRef}
          className={cn(
            "pb-4 pt-0 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}>
          {children}
        </div>
      </div>
    </div>
  );
});
AccordionItem.displayName = "AccordionItem";

export type { AccordionItemProps };
export { AccordionItem };
