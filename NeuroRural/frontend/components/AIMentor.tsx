"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, X, MessageSquare, Loader2, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { askMentor } from "@/lib/api"
import { cn } from "@/lib/utils"

export function AIMentor() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([
    { role: "bot", content: "Namaste! I am Aasha Mentor. How can I assist you with clinical protocols today?" }
  ])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!query.trim() || loading) return

    const userMsg = query.trim()
    setMessages(prev => [...prev, { role: "user", content: userMsg }])
    setQuery("")
    setLoading(true)

    try {
      const { response } = await askMentor(userMsg)
      setMessages(prev => [...prev, { role: "bot", content: response }])
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", content: "I'm having trouble connecting to my knowledge base. Please try again or consult your local supervisor." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-24 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-transform"
        >
          <Bot className="h-7 w-7 text-white" />
        </Button>
      </motion.div>

      {/* Mentor Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed inset-x-4 bottom-24 md:inset-auto md:right-6 md:bottom-24 md:w-96 z-50 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Aasha Mentor</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Enterprise AI</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="h-[400px] overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                      m.role === "user" 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about symptoms or protocols..."
                  className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!query.trim() || loading}
                  size="icon" 
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-center text-slate-500 mt-3">
                Powered by Claude 3 Opus • Verified Medical Knowledge
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
