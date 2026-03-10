"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, User, Loader2, Shield } from "lucide-react"
import { Button } from "./ui/button"

interface TeleConsultationProps {
  isOpen: boolean
  onClose: () => void
  patientName: string
  diagnosis: string
}

export function TeleConsultation({ isOpen, onClose, patientName, diagnosis }: TeleConsultationProps) {
  const [status, setStatus] = useState<"connecting" | "connected" | "ended">("connecting")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let interval: any
    if (isOpen) {
      setStatus("connecting")
      const timeout = setTimeout(() => setStatus("connected"), 3000)
      
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)

      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
        setTimer(0)
      }
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8"
      >
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative w-full max-w-5xl aspect-video bg-slate-900 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Main Video Area (Simulated) */}
          <div className="flex-1 relative bg-slate-800/50">
            {status === "connecting" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping bg-blue-500/20 rounded-full" />
                  <div className="relative p-8 bg-slate-900 rounded-full border border-blue-500/30">
                    <User className="h-16 w-16 text-blue-400" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">Connecting to District Medical Officer...</h2>
                <p className="text-slate-400 animate-pulse">Establishing secure P2P link</p>
              </div>
            ) : (
              <div className="absolute inset-0 group">
                {/* Doctor Avatar Placeholder */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                   <div className="text-center space-y-4">
                      <div className="w-32 h-32 mx-auto rounded-full bg-slate-700 flex items-center justify-center border-4 border-emerald-500/20">
                        <User className="h-16 w-16 text-slate-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Dr. Arvind Kumar</h2>
                        <p className="text-emerald-400 font-medium tracking-wide uppercase text-xs">District Specialist • Online</p>
                      </div>
                   </div>
                </div>

                {/* Self View Floating */}
                <motion.div 
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  className="absolute top-6 right-6 w-48 aspect-video bg-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden cursor-move"
                >
                  {isVideoOff ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                      <VideoOff className="h-6 w-6 text-slate-700" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                       <User className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-medium">
                    You (ASHA)
                  </div>
                </motion.div>

                {/* Patient Info Overlay */}
                <div className="absolute top-6 left-6 p-4 bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl max-w-xs space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Case</div>
                  <h3 className="font-bold text-white leading-tight">{patientName}</h3>
                  <p className="text-xs text-slate-300 line-clamp-1">{diagnosis}</p>
                </div>
              </div>
            )}

            {/* Top Bar Info */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start pointer-events-none">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-full border border-white/5 pointer-events-auto">
                 <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-xs font-mono text-white">{formatTime(timer)}</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-500/20 pointer-events-auto">
                 <Shield className="h-3 w-3 text-emerald-400" />
                 <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Encrypted Connection</span>
               </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-slate-950 p-8 flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className={`h-14 w-14 rounded-full border-white/5 transition-all ${
                isMuted ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`h-14 w-14 rounded-full border-white/5 transition-all ${
                isVideoOff ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>

            <Button
              onClick={onClose}
              className="h-16 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl shadow-red-500/30 flex items-center gap-3 font-bold text-lg group"
            >
              <PhoneOff className="h-6 w-6 group-hover:rotate-[135deg] transition-transform" />
              End Call
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-white/5 bg-slate-800 text-white hover:bg-slate-700"
            >
              <Maximize2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
