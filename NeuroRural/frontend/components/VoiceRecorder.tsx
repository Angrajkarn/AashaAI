"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Square, Loader2, Volume2, Sparkles, RefreshCcw } from "lucide-react"
import { Button } from "./ui/button"
import { transcribeAudio } from "@/lib/api"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  onAnalysis: (analysis: any) => void
}

export function VoiceRecorder({ onTranscript, onAnalysis }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        handleProcessAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      alert("Microphone access denied or not available.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleProcessAudio = async (blob: Blob) => {
    setIsProcessing(true)
    try {
      const { transcription, analysis } = await transcribeAudio(blob)
      onTranscript(transcription)
      onAnalysis(analysis)
    } catch (err) {
      console.error(err)
      alert("Voice processing failed. Falling back to manual input.")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-4">
      <div className={cn(
        "relative rounded-3xl p-8 border-2 transition-all duration-500 overflow-hidden",
        isRecording 
          ? "bg-red-500/5 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]" 
          : "bg-slate-900 border-slate-800 shadow-xl",
        isProcessing && "bg-blue-500/5 border-blue-500/50"
      )}>
        {/* Decorative Waveforms */}
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 40, 10] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.5, 
                    delay: i * 0.05,
                    ease: "easeInOut"
                  }}
                  className="w-1 mx-0.5 bg-red-500 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500",
            isRecording ? "bg-red-500 scale-110 shadow-lg shadow-red-500/30" : "bg-slate-800",
            isProcessing && "bg-blue-500 animate-spin"
          )}>
            {isProcessing ? (
              <RefreshCcw className="h-10 w-10 text-white" />
            ) : isRecording ? (
              <Square className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-slate-300" />
            )}
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-lg text-slate-100 italic">
              {isProcessing ? "Analyzing Audio..." : isRecording ? "Recording symptoms..." : "Ready to listen"}
            </h3>
            <p className="text-sm text-slate-500 font-medium tracking-wide">
              {isRecording ? formatTime(duration) : "Speak in any local dialect"}
            </p>
          </div>

          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn(
              "w-full h-14 rounded-2xl text-lg font-bold transition-all",
              isRecording 
                ? "bg-red-600 hover:bg-red-500 text-white" 
                : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950"
            )}
          >
            {isRecording ? "Stop Recording" : "Start Voice Triage"}
          </Button>
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-widest animate-pulse">
              <Sparkles className="h-3 w-3" /> AWS Transcribe & Claude 3 Opus Active
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
