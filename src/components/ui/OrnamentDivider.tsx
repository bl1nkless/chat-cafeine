import React from "react";
import { cn } from "@/lib/utils";

interface OrnamentDividerProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

export function OrnamentDivider({ className, ...props }: OrnamentDividerProps) {
  return (
    <svg
      viewBox="0 0 120 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-24 sm:w-28 h-4 text-sand/80 mx-auto select-none", className)}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M 10 8 L 45 8 C 50 8, 55 4, 60 4 C 65 4, 70 12, 60 12 C 50 12, 55 4, 60 4 C 65 4, 70 8, 75 8 L 110 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}
