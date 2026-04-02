import { DashboardLayout } from "@/components/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
        </div>

        <div className="flex gap-2 border-b">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-t" />
          ))}
        </div>

        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <div className="h-6 w-40 bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-32 w-full bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
