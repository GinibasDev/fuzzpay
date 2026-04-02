import { DashboardLayout } from "@/components/dashboard-layout"
import { SkeletonStats, SkeletonTable } from "@/components/skeleton-loader"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>

        <SkeletonStats count={5} />

        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <SkeletonTable rows={5} columns={6} />
        </div>
      </div>
    </DashboardLayout>
  )
}
