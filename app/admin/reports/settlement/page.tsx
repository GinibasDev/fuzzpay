"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Search, Download } from "lucide-react"

export default function AdminSettlementReportPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [merchantId, setMerchantId] = useState("")

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ type: 'settlement' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (merchantId) params.append('merchantId', merchantId)
      
      const response = await fetch(`/api/reports?${params.toString()}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Fetch report error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    if (reportData.length === 0) return

    const headers = ["Date", "Settlements", "Total Amount", "Fees", "Net Amount"]
    const csvData = reportData.map(row => [
      row.date,
      row.count,
      row.totalAmount,
      row.serviceFee,
      row.netAmount
    ])

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `admin_settlement_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settlement Report</h1>
          <p className="text-muted-foreground">Generate and export settlement reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Merchant ID (Optional)</label>
                <Input placeholder="All Merchants" value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button className="flex-1" onClick={fetchReport}>
                  <Search className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" onClick={handleExport} disabled={reportData.length === 0}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Data</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={5} />
            ) : reportData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Settlements</th>
                      <th className="text-left p-3 font-medium">Total Amount</th>
                      <th className="text-left p-3 font-medium">Fees</th>
                      <th className="text-left p-3 font-medium">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((data, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{data.date}</td>
                        <td className="p-3">{data.count}</td>
                        <td className="p-3 font-medium">₹{data.totalAmount.toLocaleString()}</td>
                        <td className="p-3">₹{data.serviceFee.toLocaleString()}</td>
                        <td className="p-3 font-medium">₹{data.netAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No data found or select filters to generate report</div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
