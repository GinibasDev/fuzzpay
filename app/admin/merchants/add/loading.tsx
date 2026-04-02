import { AdminLayout } from "@/components/admin-layout"
import { SkeletonForm } from "@/components/skeleton-loader"

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="h-16 w-full">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <SkeletonForm rows={10} />
      </div>
    </AdminLayout>
  )
}
