"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getPatients } from "@/lib/api"

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPatients()
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const { stats, patients } = data || { stats: { high_risk: 0, pending: 0 }, patients: [] }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-md mx-auto w-full">
          <h1 className="text-xl font-bold">AashaAI</h1>
          <span className="text-sm bg-primary-foreground/20 px-2 py-1 rounded">Online</span>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-red-50 border-red-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> At Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-red-700">{stats.high_risk}</div>
              <p className="text-xs text-red-600/80">Requires Immediate Visit</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
              <p className="text-xs text-blue-600/80">Scheduled for today</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <Link href="/triage" className="block">
          <Button className="w-full h-16 text-lg font-semibold shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            + Start New Checkup
          </Button>
        </Link>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Patients</h2>
          <div className="space-y-3">
            {patients.map((p: any) => (
              <Card key={p.id} className="hover:bg-slate-50 transition-colors">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{p.name} ({p.gender === 'Male' ? 'M' : 'F'}, {p.age}y)</h3>
                    <p className="text-sm text-slate-500">{p.symptoms} • <span className={p.risk_level === 'High' ? "text-red-600 font-bold" : "text-slate-600"}>{p.risk_level} Risk</span></p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </CardContent>
              </Card>
            ))}
            {patients.length === 0 && (
                <p className="text-center text-slate-500 py-4">No recent patients found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
