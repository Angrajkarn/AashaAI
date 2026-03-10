"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { login } from "@/lib/api"
import { useState } from "react"

function LoginButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await login("demo_fingerprint")
      router.push("/dashboard")
    } catch (e: any) {
      console.error("Login detail error:", e)
      alert(`Login failed! ${e.message || "Ensure backend is running."}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      size="lg" 
      onClick={handleLogin}
      disabled={loading}
      className="w-full text-lg font-bold h-12 bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 shadow-xl"
    >
        {loading ? "Verifying..." : "Login with Biometrics"}
    </Button>
  )
}


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            AashaAI
          </h1>
          <p className="text-lg text-slate-300">
            Empowering Rural Health. <br/> Accessible. Reliable. Offline.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
           <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white">
             <span className="text-2xl">🇮🇳</span>
             <span>Hindi / हिंदी</span>
           </Button>
           <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white">
             <span className="text-2xl">🇬🇧</span>
             <span>English</span>
           </Button>
        </div>

        <div className="w-full">
            <LoginButton />
        </div>

        <p className="text-xs text-slate-500">
          version 1.0.0 (Hackathon Build)
        </p>
      </div>
    </main>
  )
}
