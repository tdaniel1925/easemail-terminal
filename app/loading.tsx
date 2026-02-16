import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Logo skeleton */}
        <Skeleton className="h-12 w-48 rounded-lg" />
        {/* Loading text */}
        <Skeleton className="h-4 w-32 rounded" />
        {/* Spinner area */}
        <div className="mt-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    </div>
  )
}
