import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  ...props
}: SkeletonProps) {
  const base = "animate-pulse bg-border rounded";

  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

export function TransactionCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-border">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2">
          <Skeleton width={100} />
          <Skeleton width={150} height={12} />
        </div>
      </div>
      <Skeleton width={80} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton width={150} height={28} />
      <Skeleton variant="rectangular" height={120} />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="rectangular" height={80} />
      </div>
      <Skeleton variant="rectangular" height={60} />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <TransactionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="p-4 space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionCardSkeleton key={i} />
      ))}
    </div>
  );
}
