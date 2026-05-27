import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted mb-4 max-w-xs">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center h-9 px-4 rounded-xl border border-border bg-white text-sm font-medium hover:bg-accent/5 transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center h-9 px-4 rounded-xl border border-border bg-white text-sm font-medium hover:bg-accent/5 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
