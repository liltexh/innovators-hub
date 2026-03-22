import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 border border-border bg-card text-foreground font-sans outline-none rounded-md transition-all duration-200",
          "focus:border-foreground focus:ring-1 focus:ring-foreground/10",
          "placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    );
  }
);

BrutalInput.displayName = 'BrutalInput';
