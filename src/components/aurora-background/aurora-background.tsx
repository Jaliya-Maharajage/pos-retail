"use client"

import { useEffect, useRef } from "react"

export function AuroraBackground() {
  // If initial is null, include | null in the generic
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  // Provide an initial value (null) and type it as number | null
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      // handle high-DPI for crisper gradients
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas, { passive: true })

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    // Aurora animation
    let time = 0
    const animate = () => {
      time += 0.01

      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const { x: mouseX, y: mouseY } = mouseRef.current

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Create gradient based on mouse position
      const g1 = ctx.createRadialGradient(
        width * (0.2 + mouseX * 0.3),
        height * (0.3 + mouseY * 0.2),
        0,
        width * (0.2 + mouseX * 0.3),
        height * (0.3 + mouseY * 0.2),
        width * 0.8,
      )
      g1.addColorStop(0, `hsla(${200 + mouseX * 60}, 80%, 60%, 0.4)`)
      g1.addColorStop(0.3, `hsla(${180 + mouseY * 40}, 70%, 50%, 0.2)`)
      g1.addColorStop(1, "transparent")

      const g2 = ctx.createRadialGradient(
        width * (0.8 - mouseX * 0.3),
        height * (0.7 - mouseY * 0.2),
        0,
        width * (0.8 - mouseX * 0.3),
        height * (0.7 - mouseY * 0.2),
        width * 0.6,
      )
      g2.addColorStop(0, `hsla(${160 + mouseY * 80}, 75%, 55%, 0.3)`)
      g2.addColorStop(0.4, `hsla(${140 + mouseX * 50}, 65%, 45%, 0.15)`)
      g2.addColorStop(1, "transparent")

      const g3 = ctx.createLinearGradient(0, 0, width, height)
      g3.addColorStop(0, `hsla(${220 + Math.sin(time) * 30}, 70%, 50%, ${0.1 + mouseY * 0.1})`)
      g3.addColorStop(0.5, `hsla(${180 + Math.cos(time * 1.5) * 40}, 80%, 60%, ${0.15 + mouseX * 0.1})`)
      g3.addColorStop(1, `hsla(${160 + Math.sin(time * 0.8) * 50}, 75%, 55%, ${0.1 + mouseY * 0.05})`)

      ctx.fillStyle = g1
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, width, height)

      // Particles
      for (let i = 0; i < 5; i++) {
        const x = (width * (0.1 + i * 0.2) + Math.sin(time + i) * 100 + mouseX * 50) % width
        const y = (height * (0.2 + Math.cos(time * 0.7 + i) * 0.3) + mouseY * 100) % height

        const pg = ctx.createRadialGradient(x, y, 0, x, y, 30)
        pg.addColorStop(0, `hsla(${200 + i * 20 + mouseX * 30}, 80%, 70%, 0.6)`)
        pg.addColorStop(1, "transparent")

        ctx.fillStyle = pg
        ctx.fillRect(x - 30, y - 30, 60, 60)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)" }}
    />
  )
}
