import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* View selector */}
      <div className="flex gap-2">
        {['Day', 'Week', 'Month', 'Agenda'].map((view) => (
          <Skeleton key={view} className="h-9 w-20" />
        ))}
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg">
        {/* Week header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 border-r last:border-r-0">
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {[1, 2, 3, 4, 5].map((week) => (
          <div key={week} className="grid grid-cols-7 border-b last:border-b-0">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="min-h-32 p-2 border-r last:border-r-0 space-y-1">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-16 w-full rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Event list sidebar */}
      <div className="mt-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
