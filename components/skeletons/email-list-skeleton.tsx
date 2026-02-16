import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EmailListSkeletonProps {
  count?: number;
  className?: string;
}

export function EmailListSkeleton({
  count = 10,
  className,
}: EmailListSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <EmailListItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmailListItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b hover:bg-accent/50">
      {/* Checkbox */}
      <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />

      {/* Star icon */}
      <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />

      {/* Avatar */}
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Sender name + time */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16 flex-shrink-0" />
        </div>

        {/* Subject */}
        <Skeleton className="h-4 w-full max-w-md" />

        {/* Preview */}
        <Skeleton className="h-3 w-full max-w-lg" />

        {/* Labels */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Attachment indicator */}
      <Skeleton className="h-4 w-4 mt-1 flex-shrink-0" />
    </div>
  );
}
