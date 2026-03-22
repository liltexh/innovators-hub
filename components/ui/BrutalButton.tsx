import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost" | "success" | "secondary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium border cursor-pointer rounded-md transition-all duration-200";

    const variants = {
      default:
        "bg-card text-foreground border-border hover:bg-secondary hover:border-foreground/30",
      primary:
        "bg-foreground text-primary-foreground border-foreground hover:bg-foreground/90 hover:disabled:text-foreground",
      outline:
        "bg-transparent text-foreground border-foreground hover:bg-secondary",
      ghost:
        "bg-transparent text-foreground border-transparent hover:bg-secondary",
      success:
        "bg-[hsl(142,72%,45%)] text-primary-foreground border-transparent hover:bg-[hsl(142,72%,40%)]",
      secondary:
        "bg-secondary text-foreground border-border hover:bg-secondary/70 hover:border-foreground/30",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          "active:scale-[0.98]",
          (disabled || isLoading) &&
            "opacity-50 cursor-not-allowed hover:bg-card",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          children
        )}
      </button>
    );
  }
);

BrutalButton.displayName = "BrutalButton";
