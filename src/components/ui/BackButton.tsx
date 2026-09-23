"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface BackButtonProps {
  /** Optional custom text for the button */
  label?: string;
  /** Optional fallback URL if there's no browser history (defaults to homepage) */
  fallbackUrl?: string;
  /** Visual variant of the button */
  variant?: "primary" | "secondary" | "outline" | "ghost";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the arrow icon */
  showIcon?: boolean;
}

export function BackButton({
  label = "Go Back",
  fallbackUrl = "/",
  variant = "ghost",
  size = "md",
  className = "",
  showIcon = true,
}: BackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to the specified URL
      router.push(fallbackUrl);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoBack}
      className={className}
    >
      {showIcon && (
        <ArrowLeftIcon className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}

export default BackButton;