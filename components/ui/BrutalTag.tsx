import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BrutalTagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'active' | 'muted';
  interactive?: boolean;
  selected?: boolean;
}

export const BrutalTag = forwardRef<HTMLSpanElement, BrutalTagProps>(
  ({ className, variant = 'default', interactive = false, selected = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-secondary border-border text-foreground",
      active: "bg-foreground border-foreground text-primary-foreground",
      muted: "bg-muted border-border text-muted-foreground",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-1 border font-mono text-xs rounded-md transition-all duration-200",
          variants[variant],
          interactive && "cursor-pointer hover:border-foreground/50",
          selected && "bg-foreground text-primary-foreground border-foreground",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

BrutalTag.displayName = 'BrutalTag';
