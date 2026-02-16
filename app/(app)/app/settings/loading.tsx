import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex gap-6 p-6">
      {/* Settings sidebar */}
      <div className="hidden md:block w-64 space-y-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Form sections */}
        <div className="space-y-6">
          {[1, 2, 3].map((section) => (
            <div key={section} className="p-6 border rounded-lg space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-4">
                {[1, 2, 3].map((field) => (
                  <div key={field} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
