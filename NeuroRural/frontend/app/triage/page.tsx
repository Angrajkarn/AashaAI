"use client"

import { useState } from "react"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { CameraInput } from "@/components/CameraInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, ArrowLeft, Loader2, Sparkles, Activity, MessageCircle } from "lucide-react"
import Link from "next/link"
import { analyzeMultimodal } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { TeleConsultation } from "@/components/TeleConsultation"

export default function TriagePage() {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input")
  const [symptoms, setSymptoms] = useState<string>("")
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [isConsultOpen, setIsConsultOpen] = useState(false)

  const handleVoiceSuccess = (text: string) => {
    setSymptoms(text)
  }
  
  const handleAnalysisSuccess = (data: any) => {
    setAnalysis(data)
    setStep("result")
  }

  const handleAnalyze = async () => {
    setStep("analyzing")
    try {
      const data = await analyzeMultimodal(symptoms, imageBlob, 30)
      setAnalysis(data)
      setStep("result")
    } catch (error) {
      console.error("Analysis failed", error)
      setStep("input")
      alert("Failed to connect to AI server. Ensure backend is running.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div className="flex justify-between items-center max-w-md mx-auto w-full p-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-300">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-100">AI Checkup</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full pb-20 overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {/* Input Step */}
          {step === "input" && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <VoiceRecorder onTranscript={handleVoiceSuccess} onAnalysis={handleAnalysisSuccess} />

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <MessageCircle className="h-4 w-4" /> Refine Symptoms
                 </h3>
                 <textarea
                    className="w-full p-4 border border-slate-700 bg-slate-950/50 rounded-2xl min-h-[120px] text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                    placeholder="Transcription will appear here. You can edit or type manually..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl opacity-80 hover:opacity-100 transition-opacity">
                <h3 className="font-semibold text-slate-100 text-center mb-4">Visual Check (Optional)</h3>
                <CameraInput onCapture={(blob) => setImageBlob(blob)} />
                {imageBlob && (
                  <p className="text-center text-xs text-emerald-400 mt-2">
                    Image successfully attached.
                  </p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full h-16 rounded-2xl text-lg font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 border-0 disabled:opacity-50" 
                  onClick={handleAnalyze}
                  disabled={!symptoms || symptoms.length < 3}
                >
                  <Sparkles className="mr-2 h-5 w-5" /> Run Multimodal AI Triage
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Analyzing Step */}
          {step === "analyzing" && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center justify-center h-[60vh] space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse rounded-full"></div>
                <Loader2 className="h-16 w-16 text-emerald-400 animate-spin relative z-10" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Consulting Medical AI...
                </p>
                <p className="text-sm text-slate-400">Cross-referencing WHO & IPHS Guidelines via AWS</p>
              </div>
            </motion.div>
          )}

          {/* Result Step */}
          {step === "result" && analysis && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Diagnosis Card */}
              <div className={`p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${
                analysis.urgent 
                  ? "bg-red-950/30 border-red-500/40 shadow-red-900/20" 
                  : "bg-emerald-950/30 border-emerald-500/40 shadow-emerald-900/20"
              }`}>
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  {analysis.urgent ? <AlertTriangle className="h-32 w-32 text-red-500" /> : <CheckCircle className="h-32 w-32 text-emerald-500" />}
                </div>
                
                <div className="flex items-start gap-4 mb-4 relative z-10">
                   {analysis.urgent ? (
                     <div className="p-3 bg-red-500/20 rounded-2xl shrink-0">
                       <AlertTriangle className="text-red-500 h-8 w-8" />
                     </div>
                   ) : (
                     <div className="p-3 bg-emerald-500/20 rounded-2xl shrink-0">
                       <CheckCircle className="text-emerald-500 h-8 w-8" />
                     </div>
                   )}
                   <div>
                     <h2 className="text-2xl font-extrabold text-slate-100 leading-tight">{analysis.diagnosis}</h2>
                     <p className={`text-sm font-bold mt-2 inline-flex px-2 py-1 rounded-full ${
                       analysis.urgent ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                     }`}>
                       {(analysis.confidence * 100).toFixed(0)}% AI Confidence
                     </p>
                   </div>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="p-1 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900">
                <div className="bg-slate-950 p-6 rounded-[23px] space-y-5">
                  <div>
                    <h3 className="text-sm uppercase tracking-wider font-bold text-slate-400 mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" /> Action Protocol
                    </h3>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 leading-relaxed">
                      {analysis.recommendation}
                    </div>
                  </div>

                  {analysis.referral_needed && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-center font-bold border border-red-500/30 flex flex-col items-center justify-center gap-2"
                    >
                      <AlertTriangle className="h-6 w-6 animate-pulse" />
                      REFERRAL SLIP AUTOMATICALLY GENERATED
                    </motion.div>
                  )}

                  {analysis.urgent && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button 
                        onClick={() => setIsConsultOpen(true)}
                        className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/40 flex items-center justify-center gap-3 font-bold group"
                      >
                        <Activity className="h-5 w-5 group-hover:animate-pulse" />
                        Initiate Emergency Doctor Consult
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-4">
                <Button 
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700" 
                  onClick={() => {
                    setSymptoms("")
                    setImageBlob(null)
                    setStep("input")
                  }}
                >
                  Start Another Checkup
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <TeleConsultation 
        isOpen={isConsultOpen} 
        onClose={() => setIsConsultOpen(false)}
        patientName="Emergency Patient"
        diagnosis={analysis?.diagnosis || "Unknown Condition"}
      />
    </div>
  )
}
