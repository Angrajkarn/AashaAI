"use client"

import * as React from "react"
import { Button } from "./ui/button"
import { Camera, RefreshCw } from "lucide-react"

interface CameraInputProps {
  onCapture: (blob: Blob) => void
}

export function CameraInput({ onCapture }: CameraInputProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
       if (videoRef.current) {
         videoRef.current.srcObject = stream
       }
       setIsCameraOpen(true)
     } catch (err) {
       console.error("Camera error:", err)
       alert("Could not access camera. Please allow permissions.")
     }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
    setIsCameraOpen(false)
  }

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        
        // Draw video frame to canvas
        context.drawImage(videoRef.current, 0, 0)
        
        // Get data URL for preview
        const dataUrl = canvasRef.current.toDataURL('image/png')
        setPreview(dataUrl)
        
        // Convert to blob
        canvasRef.current.toBlob((blob) => {
          if (blob) onCapture(blob)
        }, 'image/png')
        
        stopCamera()
      }
    }
  }

  const reset = () => {
    setPreview(null)
    setIsCameraOpen(false)
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
       const stream = videoRef.current?.srcObject as MediaStream
       stream?.getTracks().forEach(track => track.stop())
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {preview ? (
         <div className="relative w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden">
           <img src={preview} alt="Captured" className="object-cover w-full h-full" />
         </div>
      ) : isCameraOpen ? (
        <div className="relative w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden">
           <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
           <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="w-full max-w-xs aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed" onClick={startCamera}>
           <div className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Camera className="h-10 w-10 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Tap to Open Camera</span>
           </div>
        </div>
      )}

      {preview ? (
        <Button variant="outline" onClick={reset} className="w-full max-w-xs">
          <RefreshCw className="mr-2 h-4 w-4" /> Retake Photo
        </Button>
      ) : isCameraOpen ? (
         <Button onClick={handleCapture} className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white">
           <div className="w-4 h-4 rounded-full bg-white mr-2 animate-pulse" /> Take Picture
         </Button>
      ) : (
        <Button onClick={startCamera} className="w-full max-w-xs">
          <Camera className="mr-2 h-4 w-4" /> Open Camera
        </Button>
      )}
    </div>
  )
}
