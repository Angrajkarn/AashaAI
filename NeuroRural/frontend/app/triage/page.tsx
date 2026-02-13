"use client"

import { useState } from "react"
import { VoiceInput } from "@/components/VoiceInput"
import { CameraInput } from "@/components/CameraInput"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { analyzeSymptoms } from "@/lib/api"

export default function TriagePage() {
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input")
  const [symptoms, setSymptoms] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)

  const handleTranscript = (text: string) => {
    setSymptoms((prev) => prev + (prev ? " " : "") + text)
  }

  const handleAnalyze = async () => {
    setStep("analyzing")
    try {
      // Call Backend API
      const data = await analyzeSymptoms(symptoms)
      setAnalysis(data)
      setStep("result")
    } catch (error) {
      console.error("Analysis failed", error)
      setStep("input") // Go back on error
      alert("Failed to connect to AI server. Ensure backend is running.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h1 className="text-lg font-bold">New Checkup</h1>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">
        {step === "input" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-center">Describe Symptoms</h3>
                <VoiceInput onTranscript={handleTranscript} isProcessing={false} />
                
                <textarea
                  className="w-full p-3 border rounded-md min-h-[100px] text-sm"
                  placeholder="Or type symptoms here..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-center">Visual Check (Optional)</h3>
                <CameraInput onCapture={(blob) => console.log("Captured", blob)} />
              </CardContent>
            </Card>

            <Button 
              className="w-full h-14 text-lg shadow-md" 
              onClick={handleAnalyze}
              disabled={!symptoms || symptoms.length < 3}
            >
              Analyze Symptoms
            </Button>
          </div>
        )}

        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-medium text-slate-600">Consulting AI Medical Protocols...</p>
            <p className="text-sm text-slate-400">Comparing with WHO Guidelines</p>
          </div>
        )}

        {step === "result" && analysis && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <Card className={`border-l-4 ${analysis.urgent ? "border-l-red-500 bg-red-50" : "border-l-green-500 bg-green-50"}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                   {analysis.urgent ? <AlertTriangle className="text-red-600 h-6 w-6" /> : <CheckCircle className="text-green-600 h-6 w-6" />}
                   <h2 className="text-xl font-bold">{analysis.diagnosis}</h2>
                </div>
                <p className="text-sm font-medium opacity-80">Confidence: {(analysis.confidence * 100).toFixed(0)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Recommended Action Protocol</h3>
                  <div className="p-3 bg-slate-100 rounded-md text-sm leading-relaxed text-slate-700">
                    {analysis.recommendation}
                  </div>
                </div>

                {analysis.referral_needed && (
                  <div className="p-3 bg-amber-100 text-amber-900 rounded-md text-center font-bold border border-amber-200">
                    ⚡ REFERRAL SLIP GENERATED
                  </div>
                )}
              </CardContent>
            </Card>

            <Button className="w-full" variant="outline" onClick={() => setStep("input")}>
              Start New Checkup
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
