"use client"

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { CameraOffIcon } from "lucide-react"

import { Spinner } from "@workspace/ui/components/spinner"

// Frames are scaled down before decoding; a ticket QR code held up to the
// camera is still several hundred pixels across at this size.
const decodeSize = 640
const decodeIntervalMs = 150
// Large enough for the full-size downloaded ticket.
const imageDecodeSize = 2400

// Reads a QR code from an uploaded image, such as the downloaded e-ticket.
export async function decodeQrImageFile(file: File) {
  const bitmap = await createImageBitmap(file)

  try {
    const scale = Math.min(
      1,
      imageDecodeSize / Math.max(bitmap.width, bitmap.height)
    )
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d", { willReadFrequently: true })

    if (!context) {
      return null
    }

    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const image = context.getImageData(0, 0, canvas.width, canvas.height)

    return jsQR(image.data, image.width, image.height)?.data ?? null
  } finally {
    bitmap.close()
  }
}

function getCameraErrorMessage(error: unknown) {
  const name = error instanceof DOMException ? error.name : ""

  if (name === "NotAllowedError") {
    return "Camera access was blocked. Allow it in the browser's site settings, or upload your ticket image below."
  }

  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No camera was found on this device. Upload your ticket image below instead."
  }

  if (name === "NotReadableError") {
    return "The camera is being used by another app. Close it and reload this page."
  }

  return "The camera couldn't start. Reload the page, or upload your ticket image below."
}

type QrScannerProps = {
  onScan: (value: string) => void
}

// Starts the camera when mounted and stops it when unmounted.
export function QrScanner({ onScan }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onScanRef = useRef(onScan)
  const [cameraState, setCameraState] = useState<
    "starting" | "scanning" | "error"
  >("starting")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d", { willReadFrequently: true })
    let stream: MediaStream | undefined
    let animationFrame = 0
    let lastDecodeTime = 0
    let isStopped = false

    const fail = (message: string) => {
      if (!isStopped) {
        setErrorMessage(message)
        setCameraState("error")
      }
    }

    const scanFrame = (time: number) => {
      if (isStopped) {
        return
      }

      animationFrame = requestAnimationFrame(scanFrame)

      if (
        !context ||
        time - lastDecodeTime < decodeIntervalMs ||
        video.readyState < video.HAVE_ENOUGH_DATA
      ) {
        return
      }

      lastDecodeTime = time

      const scale = Math.min(
        1,
        decodeSize / Math.max(video.videoWidth, video.videoHeight)
      )

      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const image = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(image.data, image.width, image.height, {
        inversionAttempts: "dontInvert",
      })

      if (code?.data) {
        onScanRef.current(code.data)
      }
    }

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        fail(
          "The camera only works over a secure (HTTPS) connection. Upload your ticket image below instead."
        )
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        })

        if (isStopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        video.srcObject = stream
        await video.play()
        setCameraState("scanning")
        animationFrame = requestAnimationFrame(scanFrame)
      } catch (error) {
        fail(getCameraErrorMessage(error))
      }
    }

    void startCamera()

    return () => {
      isStopped = true
      cancelAnimationFrame(animationFrame)
      stream?.getTracks().forEach((track) => track.stop())
      video.srcObject = null
    }
  }, [])

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-950">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label="Camera preview"
        className="size-full object-cover"
      />

      {cameraState === "scanning" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[16%] rounded-xl border-2 border-white/85 shadow-[0_0_0_100vmax_rgb(0_0_0/0.35)]"
        />
      )}

      {cameraState === "starting" && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-white/80">
          <Spinner />
          Starting camera...
        </div>
      )}

      {cameraState === "error" && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-sm leading-6 text-white/85"
        >
          <CameraOffIcon aria-hidden="true" className="size-8 text-white/60" />
          {errorMessage}
        </div>
      )}
    </div>
  )
}
