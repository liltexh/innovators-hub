import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-card border border-border p-4 rounded-md transition-all duration-200",
          interactive && "hover:border-foreground/30 hover:shadow-subtle cursor-pointer active:scale-[0.99]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrutalCard.displayName = 'BrutalCard';
