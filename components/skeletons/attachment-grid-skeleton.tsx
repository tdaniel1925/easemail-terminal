import { Skeleton } from "@/components/ui/skeleton"

interface AttachmentGridSkeletonProps {
  count?: number;
}

export function AttachmentGridSkeleton({ count = 12 }: AttachmentGridSkeletonProps) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <Skeleton className="h-24 w-full rounded" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}
