import { Skeleton } from "@/components/ui/skeleton"

export default function InboxLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Folder sidebar */}
      <div className="hidden lg:flex w-48 border-r bg-muted/40 flex-col p-4 space-y-2">
        {['Inbox', 'Starred', 'Sent', 'Drafts', 'Archive', 'Trash'].map((folder) => (
          <Skeleton key={folder} className="h-9 w-full rounded-md" />
        ))}
      </div>

      {/* Email list */}
      <div className="flex-1 border-r">
        {/* Search bar */}
        <div className="p-4 border-b">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Email items */}
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />

                <div className="flex-1 space-y-2">
                  {/* Sender name and time */}
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>

                  {/* Subject */}
                  <Skeleton className="h-4 w-3/4" />

                  {/* Preview */}
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email preview pane */}
      <div className="hidden xl:flex w-[600px] flex-col">
        {/* Header */}
        <div className="p-6 border-b space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
