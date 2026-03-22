import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: 'amateur' | 'beginner' | 'intermediate' | 'professional';
}

const levelConfig = {
  amateur: { className: 'bg-muted text-muted-foreground', label: 'Amateur' },
  beginner: { className: 'bg-secondary text-foreground', label: 'Beginner' },
  intermediate: { className: 'bg-secondary text-foreground', label: 'Intermediate' },
  professional: { className: 'bg-foreground text-primary-foreground', label: 'Professional' },
};

export function LevelBadge({ level }: LevelBadgeProps) {
  const config = levelConfig[level];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 border border-border font-mono text-xs rounded-md",
      config.className
    )}>
      {config.label}
    </span>
  );
}
