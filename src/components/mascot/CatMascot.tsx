import React from "react";
import { cn } from "@/lib/utils";

export type CatPose = "sit" | "walk" | "peek" | "sleep" | "idle";

interface CatMascotProps extends React.SVGAttributes<SVGSVGElement> {
  pose?: CatPose;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function CatMascot({
  pose = "sit",
  className,
  size = "default",
  ...props
}: CatMascotProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    default: "w-12 h-12",
    lg: "w-20 h-20",
  };

  if (pose === "sit") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 transition-transform", sizeClasses[size], className)}
        {...props}
      >
        {/* Cat Sitting Silhouette */}
        <path d="M52 28 C50 20, 42 16, 36 22 C32 20, 28 26, 30 34 C25 39, 24 50, 26 62 C27 70, 31 82, 38 88 C45 92, 58 92, 64 86 C67 82, 68 76, 68 70 C70 66, 75 66, 80 72 C83 75, 87 77, 90 73 C92 70, 90 64, 84 60 C78 56, 72 58, 70 64 C68 56, 66 46, 60 38 C58 35, 55 30, 52 28 Z M34 23 L40 30 L32 32 Z M48 23 L51 32 L44 31 Z" />
      </svg>
    );
  }

  if (pose === "walk") {
    return (
      <svg
        viewBox="0 0 120 70"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 transition-transform", sizeClasses[size], className)}
        {...props}
      >
        {/* Cat Walking Silhouette */}
        <path d="M102 24 C100 18, 93 14, 88 18 C85 16, 81 20, 83 26 C75 28, 64 30, 52 31 C40 32, 28 36, 22 42 C16 48, 12 36, 8 26 C6 20, 4 18, 2 20 C0 22, 2 30, 6 42 C10 54, 18 64, 28 64 C32 64, 34 58, 34 50 C38 56, 44 64, 48 64 C52 64, 54 56, 54 48 C60 52, 68 64, 74 64 C78 64, 80 56, 80 46 C84 50, 90 60, 96 60 C100 60, 102 52, 98 42 C104 38, 106 32, 102 24 Z" />
      </svg>
    );
  }

  if (pose === "peek") {
    return (
      <svg
        viewBox="0 0 80 60"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 transition-transform", sizeClasses[size], className)}
        {...props}
      >
        {/* Cat Peeking Silhouette */}
        <path d="M16 60 C14 44, 20 28, 32 20 C28 12, 34 6, 40 12 C46 14, 52 14, 58 12 C64 6, 70 12, 66 20 C76 28, 80 44, 78 60 Z M33 11 L39 21 L30 20 Z M65 11 L67 20 L58 21 Z" />
      </svg>
    );
  }

  if (pose === "sleep") {
    return (
      <svg
        viewBox="0 0 100 50"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 transition-transform", sizeClasses[size], className)}
        {...props}
      >
        {/* Cat Sleeping / Curled Silhouette */}
        <path d="M15 35 C15 20, 32 10, 52 10 C72 10, 88 20, 88 35 C88 45, 75 50, 52 50 C28 50, 15 45, 15 35 Z M70 20 L76 13 L80 22 Z M58 16 L64 10 L68 18 Z" />
      </svg>
    );
  }

  // default: idle pose
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      className={cn("text-ink shrink-0 transition-transform", sizeClasses[size], className)}
      {...props}
    >
      <path d="M48 24 C46 16, 38 12, 32 18 C28 16, 24 22, 26 30 C20 36, 20 48, 22 60 C24 70, 28 84, 38 88 C46 92, 58 92, 64 86 C68 82, 70 74, 70 66 C74 72, 80 76, 86 72 C90 68, 88 60, 82 56 C76 52, 72 56, 70 62 C68 52, 64 42, 58 34 C55 30, 52 26, 48 24 Z" />
    </svg>
  );
}
