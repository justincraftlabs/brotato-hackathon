import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-lg", className)}
      style={style}
    />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-9 w-28 rounded-lg" />
      <Skeleton className="mt-2 h-3 w-24 rounded-md" />
    </div>
  );
}

const CHART_BAR_HEIGHTS = [55, 82, 42, 70, 90, 50, 73];

export function SkeletonChart({ height = 180 }: { height?: number }) {
  return (
    <div className="glass rounded-2xl p-5">
      <Skeleton className="mb-4 h-4 w-36 rounded-md" />
      <Skeleton className="mb-3 h-3 w-24 rounded-md" />
      <div className="flex items-end gap-2" style={{ height }}>
        {CHART_BAR_HEIGHTS.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonApplianceCard() {
  return (
    <div className="glass rounded-xl p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-10 rounded-md" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>
    </div>
  );
}

const SKELETON_APPLIANCE_COUNT = 3;

export function SkeletonApplianceList() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: SKELETON_APPLIANCE_COUNT }).map((_, i) => (
        <SkeletonApplianceCard key={i} />
      ))}
    </div>
  );
}
