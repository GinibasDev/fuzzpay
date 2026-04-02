"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SkeletonTable } from "@/components/skeleton-loader"
import { Download, Search } from "lucide-react"

export default function WithdrawalReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<any[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ type: 'withdrawal' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/reports?${params.toString()}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Fetch report error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleExport = () => {
    if (reportData.length === 0) return

    const headers = ["Date", "Withdrawals", "Total Amount", "Fees", "Net Amount"]
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
    link.setAttribute("download", `withdrawal_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Withdrawal Report</h1>
          <p className="text-muted-foreground">View and export withdrawal reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter & Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button className="flex-1" onClick={fetchReport}>
                  <Search className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" onClick={handleExport} disabled={reportData.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
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
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Withdrawals</th>
                      <th className="text-left p-3 font-medium">Total Amount</th>
                      <th className="text-left p-3 font-medium">Fees</th>
                      <th className="text-left p-3 font-medium">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length > 0 ? reportData.map((data, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3">{data.date}</td>
                        <td className="p-3">{data.count}</td>
                        <td className="p-3 font-medium">₹{data.totalAmount.toLocaleString()}</td>
                        <td className="p-3">₹{data.serviceFee.toLocaleString()}</td>
                        <td className="p-3 font-medium">₹{data.netAmount.toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="p-3 text-center text-muted-foreground">No data found</td>
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
