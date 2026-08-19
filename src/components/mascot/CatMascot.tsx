import React from "react";
import { cn } from "@/lib/utils";

export type CatPose = "sit" | "walk" | "peek" | "sleep" | "idle" | "stretch";

interface CatMascotProps extends React.SVGAttributes<SVGSVGElement> {
  pose?: CatPose;
  className?: string;
  size?: "sm" | "default" | "lg" | "xl";
}

export function CatMascot({
  pose = "sit",
  className,
  size = "default",
  ...props
}: CatMascotProps) {
  const sizeClasses = {
    sm: "w-6 h-6 sm:w-7 sm:h-7",
    default: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-16 h-16 sm:w-20 sm:h-20",
    xl: "w-24 h-24 sm:w-28 sm:h-28",
  };

  if (pose === "sit") {
    // Sleek sitting upright cat silhouette with curled tail & alert pointed ears
    return (
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 inline-block align-middle transition-transform duration-300 hover:scale-110 hover:-rotate-3 cursor-pointer", sizeClasses[size], className)}
        {...props}
      >
        <path d="M 46 16 C 45 12 40 8 36 12 C 34 14 30 18 31 23 C 27 27 25 34 26 42 C 26 48 27 54 28 62 C 29 70 33 80 40 86 C 47 90 56 90 62 86 C 66 83 68 78 67 72 C 67 66 69 62 74 66 C 78 69 82 72 86 68 C 88 65 86 60 82 56 C 77 52 72 54 70 60 C 69 54 67 44 62 36 C 58 30 53 24 49 20 C 49 17 48 15 46 16 Z M 34 15 L 39 22 L 32 23 Z M 46 15 L 48 23 L 42 22 Z" />
        {/* Subtle eye gleam */}
        <circle cx="36" cy="27" r="1.5" fill="#C9B79C" opacity="0.9" />
        <circle cx="43" cy="27" r="1.5" fill="#C9B79C" opacity="0.9" />
      </svg>
    );
  }

  if (pose === "walk") {
    // Graceful walking black cat silhouette with arched high tail and elegant stride
    return (
      <svg
        viewBox="0 0 140 80"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 inline-block align-middle transition-transform duration-500 hover:translate-x-4 cursor-pointer", sizeClasses[size], className)}
        {...props}
      >
        <path d="M 112 20 C 110 14 104 10 99 14 C 96 12 91 16 93 22 C 85 24 74 27 60 28 C 48 29 35 33 28 38 C 21 43 16 32 12 21 C 10 14 7 11 4 13 C 2 15 4 23 8 36 C 12 50 19 62 30 62 C 34 62 36 55 36 46 C 41 53 47 62 52 62 C 56 62 57 53 57 44 C 64 49 72 62 78 62 C 82 62 84 53 84 43 C 89 48 95 58 101 58 C 105 58 107 49 104 38 C 111 34 114 28 112 20 Z M 96 14 L 101 21 L 94 22 Z M 106 14 L 109 22 L 102 21 Z" />
        {/* Subtle eye gleam */}
        <circle cx="103" cy="25" r="1.5" fill="#C9B79C" opacity="0.9" />
      </svg>
    );
  }

  if (pose === "peek") {
    // Peeking cat over border or corner
    return (
      <svg
        viewBox="0 0 80 60"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 inline-block align-middle", sizeClasses[size], className)}
        {...props}
      >
        <path d="M 18 60 C 16 46 22 30 33 22 C 29 14 35 8 41 14 C 46 16 52 16 57 14 C 63 8 69 14 65 22 C 75 30 79 46 77 60 Z M 34 13 L 40 23 L 31 22 Z M 64 13 L 66 22 L 57 23 Z" />
        <circle cx="38" cy="29" r="2" fill="#C9B79C" opacity="0.9" />
        <circle cx="56" cy="29" r="2" fill="#C9B79C" opacity="0.9" />
      </svg>
    );
  }

  if (pose === "sleep") {
    // Curled up sleeping cat
    return (
      <svg
        viewBox="0 0 100 50"
        fill="currentColor"
        aria-hidden="true"
        className={cn("text-ink shrink-0 inline-block align-middle", sizeClasses[size], className)}
        {...props}
      >
        <path d="M 18 35 C 18 20 34 12 52 12 C 70 12 86 20 86 35 C 86 45 74 48 52 48 C 30 48 18 45 18 35 Z M 68 22 L 74 15 L 77 24 Z M 56 18 L 62 12 L 66 20 Z" />
      </svg>
    );
  }

  // Default: alert standing/sitting pose
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      className={cn("text-ink shrink-0 inline-block align-middle transition-transform duration-300 hover:scale-110 cursor-pointer", sizeClasses[size], className)}
      {...props}
    >
      <path d="M 46 16 C 45 12 40 8 36 12 C 34 14 30 18 31 23 C 27 27 25 34 26 42 C 26 48 27 54 28 62 C 29 70 33 80 40 86 C 47 90 56 90 62 86 C 66 83 68 78 67 72 C 67 66 69 62 74 66 C 78 69 82 72 86 68 C 88 65 86 60 82 56 C 77 52 72 54 70 60 C 69 54 67 44 62 36 C 58 30 53 24 49 20 C 49 17 48 15 46 16 Z" />
    </svg>
  );
}
