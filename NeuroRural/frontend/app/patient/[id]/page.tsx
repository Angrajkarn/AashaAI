"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, User, Calendar, MapPin, Phone,
  Activity, Clock, ChevronRight, FileText,
  AlertTriangle, CheckCircle2, TrendingUp,
  Download, History, Loader2, Pill, Sparkles, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getPatientDetails, generatePatientReport } from "@/lib/api"
import { format } from "date-fns"
import ReactMarkdown from 'react-markdown'

export default function PatientProfilePage() {
  const { id } = useParams()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [report, setReport] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getPatientDetails(id as string)
        .then(setPatient)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    try {
      const { report } = await generatePatientReport(id as string)
      setReport(report)
    } catch (e) {
      alert("Failed to generate AI report. Please check AWS connectivity.")
    } finally {
      setGeneratingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-950 text-slate-400 space-y-4">
        <p>Patient not found.</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans pb-10">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-300">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Patient Profile</h1>
          </div>
          <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-xs font-bold gap-2">
            <Download className="h-4 w-4" /> Export EHR
          </Button>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 p-8 shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <User className="h-32 w-32" />
          </div>
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
               <span className="text-4xl font-black text-slate-950">{patient.name[0]}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black tracking-tight">{patient.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  patient.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {patient.risk_level} Risk
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {patient.gender}, {patient.age}y
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" /> {patient.contact_number || "No Contact"}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {patient.address || "Rural Sector 4"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-lg group hover:border-slate-700 transition-colors">
             <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                   <History className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Visits</p>
                   <p className="text-2xl font-black text-slate-100">{patient.triage_history?.length || 1}</p>
                </div>
             </CardContent>
           </Card>
           
           <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-lg group hover:border-slate-700 transition-colors">
             <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                   <Clock className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Last Checkup</p>
                   <p className="text-sm font-black text-slate-100">
                     {patient.last_visit ? format(new Date(patient.last_visit), "dd MMM yyyy") : "Today"}
                   </p>
                </div>
             </CardContent>
           </Card>
        </div>

        {/* AI Referral Report Section */}
        <AnimatePresence>
          {report ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
               <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Sparkles className="h-4 w-4 text-emerald-400" /> AI Referral Report
                 </h3>
                 <Button variant="ghost" size="sm" onClick={() => setReport(null)} className="text-slate-500 hover:text-white">
                   <X className="h-4 w-4 mr-2" /> Close
                 </Button>
               </div>
               <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.05)] text-slate-300 leading-relaxed prose prose-invert prose-emerald max-w-none">
                 <ReactMarkdown>{report}</ReactMarkdown>
               </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-between group cursor-pointer"
              onClick={handleGenerateReport}
            >
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                     <Sparkles className="h-6 w-6 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 italic">Generate Intelligent Referral Report</h4>
                    <p className="text-xs text-slate-400">Synthesized by Claude 3 Opus for Transition of Care</p>
                  </div>
               </div>
               {generatingReport ? (
                 <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
               ) : (
                 <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Longitudinal History */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Clinical Timeline
          </h3>
          
          <div className="space-y-4 relative">
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-800" />
            
            <AnimatePresence>
              {patient.triage_history?.map((visit: any, idx: number) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={visit.id}
                  className="flex gap-6 group"
                >
                  <div className="relative z-10">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 ${
                      visit.urgent ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-slate-800'
                    }`}>
                      {visit.urgent ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                    </div>
                  </div>
                  
                  <Card className="flex-1 bg-slate-900/50 border-slate-800 group-hover:border-slate-700 group-hover:bg-slate-900 transition-all rounded-3xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                              {format(new Date(visit.timestamp), "MMMM dd, yyyy • HH:mm")}
                            </p>
                            <h4 className="text-lg font-bold text-slate-100">{visit.diagnosis}</h4>
                         </div>
                         <span className="text-xs font-mono text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded-md">
                           {(visit.confidence * 100).toFixed(0)}% Match
                         </span>
                      </div>
                      
                      <p className="text-sm text-slate-400 italic line-clamp-2 mb-4">
                        "{visit.symptoms}"
                      </p>
                      
                      <div className="flex items-center gap-2">
                         <div className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                            <Activity className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs font-bold text-slate-300">WHO Protocol Followed</span>
                         </div>
                         <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-600 hover:text-white">
                           <ChevronRight className="h-5 w-5" />
                         </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-6">
           <Link href="/triage" className="block">
             <Button className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-tight">
               New Triage Visit
             </Button>
           </Link>
           <Button variant="outline" className="h-14 rounded-2xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold">
             Edit Profile
           </Button>
        </div>

      </main>
    </div>
  )
}
