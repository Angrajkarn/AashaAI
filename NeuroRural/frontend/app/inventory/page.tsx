"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, AlertCircle, TrendingDown, Clock, RefreshCcw, CheckCircle2, ShoppingCart, Info, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInventoryStatus, triggerReorder } from "@/lib/api"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function InventoryDashboard() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState<number | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const data = await getInventoryStatus()
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (id: number) => {
    setReordering(id)
    try {
      await triggerReorder(id)
      alert("Procurement request sent to District Hospital.")
      fetchInventory()
    } catch (err) {
      alert("Failed to send reorder request.")
    } finally {
      setReordering(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-4 max-w-md mx-auto w-full p-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Supply Intelligence
          </h1>
        </div>
      </header>

      <main className="flex-1 p-5 max-w-md mx-auto w-full space-y-8 pb-10">
        
        {/* Insight Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Next-Gen Predictive Logistics</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            AashaAI analyzes real-time health hotspots to predict when your stock will run out.
          </p>
        </div>

        {/* Inventory List */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center py-20 gap-4">
              <RefreshCcw className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Analyzing Hotspot Demand...</p>
            </div>
          )}

          {!loading && items.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.id}
            >
              <Card className={cn(
                "bg-slate-900 border-slate-800 rounded-[28px] overflow-hidden transition-all hover:border-slate-700 shadow-xl",
                item.status === "Critical" && "border-red-500/30 bg-red-500/5"
              )}>
                <CardContent className="p-6 space-y-6">
                  {/* Item Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        item.status === "Critical" ? "bg-red-500/10" : "bg-blue-500/10"
                      )}>
                        <Package className={cn(
                          "h-6 w-6",
                          item.status === "Critical" ? "text-red-500" : "text-blue-400"
                        )} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-lg">{item.item_name}</h3>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                          {item.current_stock} {item.unit} available
                        </p>
                      </div>
                    </div>
                    {item.status === "Critical" && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-[10px] font-bold uppercase border border-red-500/20">
                        <AlertCircle className="h-3 w-3" /> Critical
                      </div>
                    )}
                  </div>

                  {/* Stock Level Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
                      <span>Stock level</span>
                      <span>Target: {item.min_threshold * 2}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (item.current_stock / (item.min_threshold * 2)) * 100)}%` }}
                        className={cn(
                          "h-full rounded-full",
                          item.current_stock <= item.min_threshold ? "bg-red-500" : "bg-blue-500"
                        )}
                      />
                    </div>
                  </div>

                  {/* AI Prediction Section */}
                  <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3 relative overflow-hidden group">
                     {/* Background Glow */}
                     <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     
                     <div className="flex items-center gap-2 relative z-10">
                        <TrendingDown className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Forecast</span>
                     </div>
                     <div className="flex justify-between items-end relative z-10">
                        <div>
                           <p className="text-[10px] text-slate-600 font-bold uppercase">Predicted Exhaustion</p>
                           <p className={cn(
                             "text-lg font-extrabold",
                             item.status === "Critical" ? "text-red-400" : "text-blue-100"
                           )}>{item.predicted_exhaustion}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] text-slate-600 font-bold uppercase">Trend</p>
                           <span className="text-xs font-bold text-red-400 flex items-center gap-1 justify-end">
                              Accelerating <TrendingDown className="h-3 w-3" />
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Actions */}
                  <Button 
                    onClick={() => handleReorder(item.id)}
                    disabled={reordering === item.id}
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold transition-all shadow-lg",
                      item.status === "Critical" 
                        ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20" 
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    )}
                  >
                    {reordering === item.id ? (
                      <RefreshCcw className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {item.status === "Critical" ? "Emergency Reorder" : "Top-up Stock"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Supply Summary */}
        <div className="p-6 rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <ShoppingCart className="h-32 w-32" />
           </div>
           
           <div className="relative z-10 space-y-4 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" /> System Healthy
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Logistics engine is connected to District Hospital (Wada North). All vital supply reorders are automated via Heatmap Intelligence.
              </p>
              <div className="pt-2">
                <Button variant="secondary" className="bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs h-9 rounded-xl font-bold">
                  Download Supply Report
                </Button>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
           <Info className="h-5 w-5 text-blue-400 shrink-0" />
           <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
             Prediction data is refreshed every 5 minutes based on triage volume clusters and historical consumption patterns in this block.
           </p>
        </div>

      </main>
    </div>
  )
}

