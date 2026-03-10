"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, Loader2, Activity, BellRing, FileText, Map as MapIcon, Package, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getPatients, API_BASE } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { AIMentor } from "@/components/AIMentor"

type Alert = {
  id: string;
  patient_id?: string;
  diagnosis: string;
  recommendation: string;
  image_url?: string;
  timestamp: Date;
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [latency, setLatency] = useState<number | null>(null)
  const [wsStatus, setWsStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")

  useEffect(() => {
    const start = Date.now()
    getPatients()
      .then((res) => {
        setLatency(Date.now() - start)
        setData(res)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })

    // Setup WebSocket for Real-time alerts
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = window.location.port === "3000"
      ? `ws://${window.location.hostname}:8000/ws`
      : `${protocol}//${window.location.host}/ws`
    
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => setWsStatus("connected")
    ws.onclose = () => setWsStatus("disconnected")
    ws.onerror = () => setWsStatus("disconnected")

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === "NEW_HIGH_RISK_PATIENT") {
          setAlerts(prev => [{
            id: Math.random().toString(),
            patient_id: msg.patient_id,
            diagnosis: msg.diagnosis,
            recommendation: msg.recommendation,
            image_url: msg.image_url,
            timestamp: new Date()
          }, ...prev])
        }
      } catch (e) {
        console.error("Failed to parse WS message", e)
      }
    }

    return () => {
      ws.close()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
      </div>
    )
  }

  const { stats, patients } = data || { stats: { high_risk: 0, pending: 0 }, patients: [] }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div className="flex justify-between items-center max-w-md mx-auto w-full p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg shadow-lg shadow-emerald-500/20">
              <Activity className="h-5 w-5 text-slate-950" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              AashaAI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg">
                <div className={`h-1.5 w-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">WS</span>
             </div>
             <div className="flex items-center gap-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg">
                <Activity className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] font-bold text-slate-100">{latency ? `${latency}ms` : '--'}</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-500 tracking-wider uppercase">Live</span>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full space-y-8 pb-20">
        
        {/* Real-time Alerts Section */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                <BellRing className="h-4 w-4 animate-bounce" /> Critical Alerts
              </h2>
              {alerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/20 rounded-full mt-1">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-red-100">{alert.diagnosis}</h3>
                      <p className="text-sm text-red-300/80 mt-1">{alert.recommendation}</p>
                      <p className="text-xs text-red-500/60 mt-2 font-mono">
                        {alert.timestamp.toLocaleTimeString()} • Patient Walk-in
                      </p>
                      {alert.image_url && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-red-500/20 max-w-xs">
                          {/* We prefix with localhost:8000/ to serve the image, assuming the backend serves static files. If not, we fall back to a placeholder or raw base64 */}
                          <img 
                            src={`http://localhost:8000/${alert.image_url}`} 
                            alt="Patient condition" 
                            className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
                            onError={(e) => {
                              // Fallback if static serving isn't enabled yet
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/triage" className="block">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full h-16 rounded-2xl text-sm font-bold shadow-xl shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 border-0">
                <Activity className="h-5 w-5 mr-2" /> Triage
              </Button>
            </motion.div>
          </Link>
          <Link href="/digitize" className="block">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full h-16 rounded-2xl text-sm font-bold shadow-xl shadow-blue-500/20 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-100">
                <FileText className="h-5 w-5 mr-2" /> Digitize
              </Button>
            </motion.div>
          </Link>
          <Link href="/inventory" className="block col-span-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button className="w-full h-12 rounded-xl text-xs font-bold bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400">
                <Package className="h-4 w-4 mr-2" /> Supply Chain & Inventory
              </Button>
            </motion.div>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">At Risk</h3>
              <AlertTriangle className="h-3 w-3 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{stats.high_risk + alerts.length}</div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pending</h3>
              <Calendar className="h-3 w-3 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">{stats.pending}</div>
          </motion.div>

          <motion.div 
            onClick={() => window.location.href='/heatmap'}
            whileHover={{ y: -2 }} 
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Intelligence</h3>
              <MapIcon className="h-3 w-3 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-slate-100">Live</div>
          </motion.div>
        </div>

        {/* Recent Patients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Recent Patients</h2>
            <Button variant="link" className="text-emerald-500 text-sm p-0 h-auto">View all</Button>
          </div>
          
          <div className="space-y-3">
            {patients.map((p: any, i: number) => (
              <Link href={`/patient/${p.id}`} key={p.id} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex justify-between items-center cursor-pointer"
                >
                  <div>
                    <h3 className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {p.name} <span className="text-slate-500 font-normal ml-1">({p.gender === 'Male' ? 'M' : 'F'}, {p.age}y)</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-400 truncate max-w-[180px]">{p.symptoms}</span>
                      <span className="text-slate-600 font-bold">•</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        p.risk_level === 'High' ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                        p.risk_level === 'Medium' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {p.risk_level}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-slate-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            ))}
            {patients.length === 0 && (
                <div className="text-center py-8 rounded-2xl border border-dashed border-slate-800">
                  <p className="text-slate-500">No recent patients found.</p>
                </div>
            )}
          </div>
        </div>

      </main>

      <AIMentor />
    </div>
  )
}
