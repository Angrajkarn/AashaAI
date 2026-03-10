"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Map as MapIcon, AlertCircle, Loader2, ArrowLeft, Thermometer, Info, Activity, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { getHotspots, getAnalyticsAlerts } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function HeatmapPage() {
  const [hotspots, setHotspots] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = () => {
      Promise.all([getHotspots(), getAnalyticsAlerts()])
        .then(([hData, aData]) => {
          setHotspots(hData)
          setAlerts(aData)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="p-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
            Health Intelligence
          </h1>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full space-y-6">
        
        {/* Active Outbreak Alerts */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
             <ShieldAlert className="h-4 w-4 text-red-500" /> Early Warning Alerts
          </h2>
          {alerts.map((alert, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={i}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-lg shadow-red-500/5"
            >
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <h3 className="font-bold text-red-100">{alert.type}: {alert.symptom}</h3>
                  <p className="text-xs text-red-200/70 mt-1">{alert.message}</p>
                  <div className="mt-2 text-[10px] font-bold text-red-500 uppercase flex items-center gap-2">
                    <Activity className="h-3 w-3" /> Location: {alert.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
         sections</section>

        {/* Heatmap Visualization Placeholder */}
        <section className="space-y-3">
           <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
             <MapIcon className="h-4 w-4 text-orange-500" /> Symptom Heatmap
          </h2>
          <div className="relative aspect-square rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
             {/* Simple Simulated Map for Hackathon Demo */}
             <div className="absolute inset-0 opacity-20 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/73.13,19.65,10,0/400x400?access_token=pk.placeholder')] bg-cover"></div>
             
             {/* Hotspot Blobs */}
             {hotspots.map((h, i) => (
               <motion.div 
                 key={i}
                 initial={{ scale: 0 }}
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                 style={{ 
                   top: `${(h.lat - 19.6) * 1000}%`, 
                   left: `${(h.lng - 73.1) * 1000}%` 
                 }}
                 className={cn(
                   "absolute w-8 h-8 rounded-full blur-md opacity-60",
                   h.risk_level === 'High' ? "bg-red-500" : "bg-orange-400"
                 )}
               />
             ))}

             <div className="absolute inset-0 flex items-center justify-center">
               {loading && <Loader2 className="h-8 w-8 animate-spin text-orange-500" />}
             </div>

             {/* Controls overlay */}
             <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-2">
                <div className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
                  <Thermometer className="h-3 w-3 text-red-500" /> Wada Block Active
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] text-slate-400">
                  Updated 2m ago
                </div>
             </div>
          </div>
        </section>

        {/* Cluster List */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Geographical Clusters</h2>
          <div className="space-y-3">
            {hotspots.slice(0, 3).map((h, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden hover:bg-slate-800/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      h.risk_level === 'High' ? "bg-red-500/10" : "bg-orange-500/10"
                    )}>
                      <Activity className={cn(
                        "h-4 w-4",
                        h.risk_level === 'High' ? "text-red-500" : "text-orange-500"
                      )} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{h.diagnosis}</h4>
                      <p className="text-[10px] text-slate-500">{h.symptoms}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-600 block">RISK</span>
                    <span className={cn(
                      "text-xs font-bold",
                      h.risk_level === 'High' ? "text-red-500" : "text-orange-500"
                    )}>{h.risk_level}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="pt-4">
           <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
              <Info className="h-5 w-5 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Aggregated symptom data helps health officers allocate vaccines and diagnostic kits more efficiently to high-risk zones.
              </p>
           </div>
        </section>

      </main>
    </div>
  )
}
