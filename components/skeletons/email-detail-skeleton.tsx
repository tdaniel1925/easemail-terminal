import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface EmailDetailSkeletonProps {
  className?: string;
}

export function EmailDetailSkeleton({ className }: EmailDetailSkeletonProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        {/* Header actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" /> {/* Back button */}
            <Skeleton className="h-9 w-9" />  {/* Archive */}
            <Skeleton className="h-9 w-9" />  {/* Delete */}
            <Skeleton className="h-9 w-9" />  {/* More */}
          </div>
          <Skeleton className="h-9 w-24" /> {/* Reply button */}
        </div>

        {/* Subject */}
        <Skeleton className="h-8 w-3/4 mb-4" />

        {/* Sender info */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" /> {/* Sender name */}
              <Skeleton className="h-4 w-32" /> {/* Timestamp */}
            </div>
            <Skeleton className="h-4 w-64" /> {/* Email address */}
          </div>
        </div>

        {/* Labels/tags */}
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        {/* Email body */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="pt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Attachments */}
        <div className="mt-6 space-y-2">
          <Skeleton className="h-5 w-32 mb-3" /> {/* "Attachments" label */}
          <div className="flex gap-3">
            <Skeleton className="h-20 w-20 rounded" />
            <Skeleton className="h-20 w-20 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
