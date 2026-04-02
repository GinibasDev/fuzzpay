import { SkeletonStats, SkeletonTable } from "@/components/skeleton-loader"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <div className="h-9 w-64 bg-muted animate-pulse rounded mb-2" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded" />
        </div>
        <SkeletonStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <SkeletonTable />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <SkeletonTable />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
