"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Download, FileText } from "lucide-react"

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [reportType, setReportType] = useState("payin")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reportData, setReportData] = useState<any[]>([])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(dateFrom && { startDate: dateFrom }),
        ...(dateTo && { endDate: dateTo }),
      })
      const response = await fetch(`/api/reports?${params.toString()}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportType, dateFrom, dateTo])

  const handleExport = (format: string) => {
    // Basic CSV export logic
    if (reportData.length === 0) return
    
    const headers = ["Date", "Transactions", "Total Amount", "Service Fee", "Net Amount", "Status"]
    const csvContent = [
      headers.join(","),
      ...reportData.map(row => [
        row.date,
        row.count,
        row.totalAmount,
        row.serviceFee,
        row.netAmount,
        row.status
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">Generate and export financial reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="reportType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payin">Payin Report</SelectItem>
                    <SelectItem value="payout">Payout Report</SelectItem>
                    <SelectItem value="settlement">Settlement Report</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => handleExport("csv")} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
              <Button onClick={() => handleExport("excel")} variant="outline" className="flex-1 bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Export as Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonTable rows={5} cols={6} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Transactions</th>
                      <th className="text-left p-3 font-medium">Total Amount</th>
                      <th className="text-left p-3 font-medium">Service Fee</th>
                      <th className="text-left p-3 font-medium">Net Amount</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-3">{row.date}</td>
                        <td className="p-3">{row.count}</td>
                        <td className="p-3 font-medium">₹{row.totalAmount.toLocaleString()}</td>
                        <td className="p-3">₹{row.serviceFee.toLocaleString()}</td>
                        <td className="p-3 font-medium text-green-600">₹{row.netAmount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {reportData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No data found for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
