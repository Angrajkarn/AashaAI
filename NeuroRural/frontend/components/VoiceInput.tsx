"use client"

import * as React from "react"
import { Button } from "./ui/button"
import { Mic, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isProcessing: boolean
}

export function VoiceInput({ onTranscript, isProcessing }: VoiceInputProps) {
  const [isRecording, setIsRecording] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US" // Could be dynamic based on user choice

        recognition.onresult = (event: any) => {
          let transcript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
             transcript += event.results[i][0].transcript
          }
          if (transcript) {
             // Debounce or just pass chunks? 
             // Ideally we pass final results, but for this UI we might want real-time updates.
             // But the parent app appends? 
             // Let's just pass the final result when recording stops or intermittent
             if (event.results[event.results.length-1].isFinal) {
                 onTranscript(event.results[event.results.length-1][0].transcript)
             }
          }
        }
        
        recognition.onerror = (event: any) => {
          console.error("Speech error", event.error)
          setIsRecording(false)
        }

        recognition.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [onTranscript])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (recognitionRef.current) {
        try {
            recognitionRef.current.start()
            setIsRecording(true)
        } catch (e) {
            console.error(e)
        }
      } else {
        alert("Speech Recognition not supported in this browser. Using simulation.")
        // Fallback simulation
        setIsRecording(true)
        setTimeout(() => {
            onTranscript("High fever and cough (Simulated)")
            setIsRecording(false)
        }, 2000)
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center rounded-full bg-secondary transition-all",
          isRecording && "animate-pulse bg-red-100"
        )}
      >
        {isRecording ? (
          <div className="flex gap-1 h-8 items-center">
            <div className="w-1 h-3 bg-red-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-6 bg-red-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-3 bg-red-500 animate-bounce"></div>
          </div>
        ) : (
          <Mic className="h-10 w-10 text-primary" />
        )}
      </div>

      <Button
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        onClick={toggleRecording}
        disabled={isProcessing}
        className="w-full max-w-xs"
      >
        {isRecording ? (
          <>
            <Square className="mr-2 h-4 w-4" /> Stop Listening
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" /> Start Speaking
          </>
        )}
      </Button>
      
      {isRecording && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Listening... (Speak in Hindi/Tamil/English)
        </p>
      )}
    </div>
  )
}
