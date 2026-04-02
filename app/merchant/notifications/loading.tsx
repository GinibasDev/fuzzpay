import { DashboardLayout } from "@/components/dashboard-layout"
import { SkeletonTable } from "@/components/skeleton-loader"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>

        <SkeletonTable rows={8} columns={6} />
      </div>
    </DashboardLayout>
  )
}
