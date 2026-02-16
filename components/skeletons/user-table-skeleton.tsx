import { Skeleton } from "@/components/ui/skeleton"

interface UserTableSkeletonProps {
  rows?: number;
}

export function UserTableSkeleton({ rows = 8 }: UserTableSkeletonProps) {
  return (
    <div className="border rounded-lg">
      {/* Table header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
