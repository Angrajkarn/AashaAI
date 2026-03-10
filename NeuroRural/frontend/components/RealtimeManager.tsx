"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Bell, Package, X } from "lucide-react"

export default function RealtimeManager() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = window.location.port === "3000"
      ? `ws://${window.location.hostname}:8000/ws`
      : `${protocol}//${window.location.host}/ws`
    
    console.log("Connecting to Real-time Sync:", wsUrl)
    const socket = new WebSocket(wsUrl)

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("Real-time Event:", data)
        
        // Add to active notifications
        const id = Date.now()
        setNotifications(prev => [...prev, { id, ...data }])
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
          removeNotification(id)
        }, 8000)
      } catch (err) {
        console.error("Failed to parse WS message", err)
      }
    }

    socket.onerror = (err) => {
      console.error("WebSocket Error:", err)
    }

    return () => socket.close()
  }, [])

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="fixed top-20 right-4 z-[9999] w-80 space-y-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto"
          >
            <div className="bg-slate-900/90 border border-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl relative overflow-hidden group">
               {/* Progress Bar */}
               <motion.div 
                 initial={{ width: "100%" }}
                 animate={{ width: "0%" }}
                 transition={{ duration: 8, ease: "linear" }}
                 className="absolute bottom-0 left-0 h-1 bg-blue-500/50"
               />
               
               <div className="flex gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    n.type === 'NEW_HIGH_RISK_PATIENT' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {n.type === 'NEW_HIGH_RISK_PATIENT' ? <AlertCircle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {n.type === 'NEW_HIGH_RISK_PATIENT' ? 'Critical Triage Alert' : 'Supply Chain Sync'}
                      </h4>
                      <button onClick={() => removeNotification(n.id)} className="text-slate-600 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm font-semibold text-white">
                      {n.type === 'NEW_HIGH_RISK_PATIENT' ? n.diagnosis : n.message}
                    </p>
                    
                    {n.recommendation && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                        {n.recommendation}
                      </p>
                    )}
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
