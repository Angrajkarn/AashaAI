"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Upload, Loader2, CheckCircle2, FileText, ArrowLeft, Pill, User, Calendar, Hospital } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { digitize } from "@/lib/api"

export default function DigitizePage() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!image) return
    setLoading(true)
    try {
      const data = await digitize(image)
      setResult(data)
    } catch (e) {
      alert("Digitization failed. Please check your connection or try a clearer photo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="p-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Digitize Records
          </h1>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <p className="text-slate-400 text-sm">
            Scan paper prescriptions or medical notes to automatically create a digital health record.
          </p>
        </div>

        {/* Capture/Upload Area */}
        <div className="space-y-4">
          {!preview ? (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center p-8 transition-colors hover:bg-slate-900/80 group"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="p-4 bg-blue-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Camera className="h-8 w-8 text-blue-400" />
              </div>
              <p className="font-semibold text-slate-200">Tap to Scan or Upload</p>
              <p className="text-xs text-slate-500 mt-1">Prescription, Report, or Slip</p>
            </motion.div>
          ) : (
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <img src={preview} alt="Prescription Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => {setPreview(null); setImage(null); setResult(null)}}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 rounded-full text-slate-400 hover:text-white backdrop-blur-md"
              >
                < ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          {preview && !result && (
            <Button 
              onClick={handleUpload}
              disabled={loading}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-slate-950 shadow-xl shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  AI Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Digitize Now
                </>
              )}
            </Button>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-10"
            >
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold">Digitization Complete</span>
              </div>

              {/* Patient Info Card */}
              <Card className="bg-slate-900 border-slate-800 rounded-2xl overflow-hidden border-l-4 border-l-blue-500 shadow-lg">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <User className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Patient Name</p>
                      <p className="font-bold text-slate-100">{result.patient_name || "Unknown"}</p>
                    </div>
                    {result.age && (
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Age</p>
                        <p className="font-bold text-slate-100">{result.age}y</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-300">{result.date || "Date N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hospital className="h-4 w-4 text-slate-500" />
                      <span className="text-xs text-slate-300 truncate">{result.hospital_name || "Clinic N/A"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medications Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Prescribed Medications</h3>
                {result.medications?.map((med: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 group hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Pill className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-100">{med.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{med.dosage}</span>
                        <span className="text-slate-700">•</span>
                        <span>{med.frequency}</span>
                        <span className="text-slate-700">•</span>
                        <span>{med.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Diagnosis Summary */}
              {result.diagnosis_notes && (
                <div className="space-y-2">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <FileText className="h-4 w-4" /> Diagnosis Summary
                   </h3>
                   <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-100/90 text-sm leading-relaxed italic">
                     "{result.diagnosis_notes}"
                   </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 font-bold">
                  Save to EHR
                </Button>
                <Button className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                  Print Summary
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
