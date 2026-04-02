import { DashboardLayout } from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>

        <div className="flex gap-2 border-b">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-muted animate-pulse rounded-t" />
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-10 w-full sm:w-48 bg-muted animate-pulse rounded" />
            <div className="h-10 w-full sm:w-48 bg-muted animate-pulse rounded" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
