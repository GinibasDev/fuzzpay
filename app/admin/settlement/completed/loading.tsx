import { AdminLayout } from "@/components/admin-layout"
import { SkeletonTable } from "@/components/skeleton-loader"

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    </AdminLayout>
  )
}
