import { AdminLayout } from "@/components/admin-layout"
import { SkeletonCard } from "@/components/skeleton-loader"

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </AdminLayout>
  )
}
