"use client"

import { useEffect, useRef, useState, type RefObject } from 'react'
import { Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

interface AuthHeroProps {
  password: string
  showPassword: boolean
  isTyping: boolean
  className?: string
}

function useBlinkLoop(active: boolean) {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (!active) {
      setIsBlinking(false)
      return
    }

    let pauseTimeout: ReturnType<typeof setTimeout> | null = null
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const schedule = () => {
      const delay = Math.random() * 4000 + 3000
      pauseTimeout = setTimeout(() => {
        if (cancelled) return
        setIsBlinking(true)
        blinkTimeout = setTimeout(() => {
          if (cancelled) return
          setIsBlinking(false)
          schedule()
        }, 150)
      }, delay)
    }

    schedule()

    return () => {
      cancelled = true
      if (pauseTimeout) clearTimeout(pauseTimeout)
      if (blinkTimeout) clearTimeout(blinkTimeout)
    }
  }, [active])

  return isBlinking
}

function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return position
}

function useMeasuredRect<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const measure = () => {
      setRect(ref.current?.getBoundingClientRect() ?? null)
    }

    measure()
    window.addEventListener('resize', measure)

    return () => window.removeEventListener('resize', measure)
  }, [ref])

  return rect
}

interface PupilProps {
  size?: number
  maxDistance?: number
  pupilColor?: string
  forceLookX?: number
  forceLookY?: number
  mousePosition: { x: number; y: number }
}

function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = '#2d2d2d',
  forceLookX,
  forceLookY,
  mousePosition,
}: PupilProps) {
  const pupilRef = useRef<HTMLDivElement>(null)
  const pupilRect = useMeasuredRect(pupilRef)

  const calculatePupilPosition = () => {
    if (!pupilRect) return { x: 0, y: 0 }

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY }
    }

    const pupilCenterX = pupilRect.left + pupilRect.width / 2
    const pupilCenterY = pupilRect.top + pupilRect.height / 2

    const deltaX = mousePosition.x - pupilCenterX
    const deltaY = mousePosition.y - pupilCenterY
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)
    const angle = Math.atan2(deltaY, deltaX)

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
  }

  const position = calculatePupilPosition()

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  )
}

interface EyeBallProps {
  size?: number
  pupilSize?: number
  maxDistance?: number
  eyeColor?: string
  pupilColor?: string
  isBlinking?: boolean
  forceLookX?: number
  forceLookY?: number
  mousePosition: { x: number; y: number }
}

function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = '#2d2d2d',
  isBlinking = false,
  forceLookX,
  forceLookY,
  mousePosition,
}: EyeBallProps) {
  const eyeRef = useRef<HTMLDivElement>(null)
  const eyeRect = useMeasuredRect(eyeRef)

  const calculatePupilPosition = () => {
    if (!eyeRect) return { x: 0, y: 0 }

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY }
    }

    const eyeCenterX = eyeRect.left + eyeRect.width / 2
    const eyeCenterY = eyeRect.top + eyeRect.height / 2

    const deltaX = mousePosition.x - eyeCenterX
    const deltaY = mousePosition.y - eyeCenterY
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)
    const angle = Math.atan2(deltaY, deltaX)

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    }
  }

  const position = calculatePupilPosition()

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center overflow-hidden rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
      }}
    >
      {!isBlinking ? (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      ) : null}
    </div>
  )
}

export function AuthHero({
  password,
  showPassword,
  isTyping,
  className,
}: AuthHeroProps) {
  const mousePosition = useMousePosition()
  const purpleBlinking = useBlinkLoop(true)
  const blackBlinking = useBlinkLoop(true)
  const [purplePeeking, setPurplePeeking] = useState(false)
  const purplePeekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const purplePeekResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)
  const purpleRect = useMeasuredRect(purpleRef)
  const blackRect = useMeasuredRect(blackRef)
  const yellowRect = useMeasuredRect(yellowRef)
  const orangeRect = useMeasuredRect(orangeRef)

  useEffect(() => {
    if (purplePeekTimeoutRef.current) {
      clearTimeout(purplePeekTimeoutRef.current)
      purplePeekTimeoutRef.current = null
    }

    if (purplePeekResetTimeoutRef.current) {
      clearTimeout(purplePeekResetTimeoutRef.current)
      purplePeekResetTimeoutRef.current = null
    }

    if (!(password.length > 0 && showPassword)) {
      setPurplePeeking(false)
      return
    }

    let cancelled = false

    const schedulePeek = () => {
      purplePeekTimeoutRef.current = setTimeout(() => {
        if (cancelled) return
        setPurplePeeking(true)
        purplePeekResetTimeoutRef.current = setTimeout(() => {
          if (cancelled) return
          setPurplePeeking(false)
          schedulePeek()
        }, 800)
      }, Math.random() * 3000 + 2000)
    }

    schedulePeek()

    return () => {
      cancelled = true
      if (purplePeekTimeoutRef.current) {
        clearTimeout(purplePeekTimeoutRef.current)
        purplePeekTimeoutRef.current = null
      }
      if (purplePeekResetTimeoutRef.current) {
        clearTimeout(purplePeekResetTimeoutRef.current)
        purplePeekResetTimeoutRef.current = null
      }
    }
  }, [password, showPassword])

  const calculatePosition = (rect: DOMRect | null) => {
    if (!rect) return { faceX: 0, faceY: 0, bodySkew: 0 }

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 3

    const deltaX = mousePosition.x - centerX
    const deltaY = mousePosition.y - centerY

    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    }
  }

  const purplePos = calculatePosition(purpleRect)
  const blackPos = calculatePosition(blackRect)
  const yellowPos = calculatePosition(yellowRect)
  const orangePos = calculatePosition(orangeRect)
  const isLookingAtEachOther = isTyping

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,17,29,0.92)_0%,rgba(8,11,20,0.98)_100%)] text-white shadow-[0_30px_90px_-30px_rgba(0,0,0,0.75)]',
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] bg-[size:22px_22px] opacity-30" />
      <div className="absolute -top-24 right-[-8%] size-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute bottom-[-14%] left-[-10%] size-80 rounded-full bg-amber-400/14 blur-3xl" />

      <div className="relative flex h-full min-h-[420px] flex-col justify-between p-6 sm:p-8 lg:min-h-[720px] lg:p-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium tracking-[0.24em] text-white/70 uppercase">
            <div className="flex size-9 items-center justify-center rounded-2xl border border-white/10 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <Sparkles className="size-4 text-amber-200" />
            </div>
            LEARNMORE
          </div>
        </div>

        <div className="grid gap-8 lg:grid-rows-[auto_1fr_auto]">
          <div className="relative flex items-end justify-center">
            <div className="relative h-[360px] w-full max-w-[620px] sm:h-[440px] lg:h-[560px]">
              <div
                ref={purpleRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '8%',
                  width: '32%',
                  height:
                    isTyping || (password.length > 0 && !showPassword) ? '96%' : '86%',
                  backgroundColor: '#6C3FF5',
                  borderRadius: '14px 14px 0 0',
                  zIndex: 1,
                  transform:
                    password.length > 0 && showPassword
                      ? 'skewX(0deg)'
                      : isTyping || (password.length > 0 && !showPassword)
                        ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(9%)`
                        : `skewX(${purplePos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  className="absolute flex gap-7 transition-all duration-700 ease-in-out sm:gap-8"
                  style={{
                    left:
                      password.length > 0 && showPassword
                        ? '12%'
                        : isLookingAtEachOther
                          ? '26%'
                          : `calc(18% + ${purplePos.faceX}px)`,
                    top:
                      password.length > 0 && showPassword
                        ? '12%'
                        : isLookingAtEachOther
                          ? '18%'
                          : `calc(12% + ${purplePos.faceY}px)`,
                  }}
                >
                  <EyeBall
                    size={18}
                    pupilSize={7}
                    maxDistance={5}
                    isBlinking={purpleBlinking}
                    mousePosition={mousePosition}
                    forceLookX={
                      password.length > 0 && showPassword
                        ? purplePeeking
                          ? 4
                          : -4
                        : isLookingAtEachOther
                          ? 3
                          : undefined
                    }
                    forceLookY={
                      password.length > 0 && showPassword
                        ? purplePeeking
                          ? 5
                          : -4
                        : isLookingAtEachOther
                          ? 4
                          : undefined
                    }
                  />
                  <EyeBall
                    size={18}
                    pupilSize={7}
                    maxDistance={5}
                    isBlinking={purpleBlinking}
                    mousePosition={mousePosition}
                    forceLookX={
                      password.length > 0 && showPassword
                        ? purplePeeking
                          ? 4
                          : -4
                        : isLookingAtEachOther
                          ? 3
                          : undefined
                    }
                    forceLookY={
                      password.length > 0 && showPassword
                        ? purplePeeking
                          ? 5
                          : -4
                        : isLookingAtEachOther
                          ? 4
                          : undefined
                    }
                  />
                </div>
              </div>

              <div
                ref={blackRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '42%',
                  width: '20%',
                  height: '64%',
                  backgroundColor: '#2D2D2D',
                  borderRadius: '12px 12px 0 0',
                  zIndex: 2,
                  transform:
                    password.length > 0 && showPassword
                      ? 'skewX(0deg)'
                      : isLookingAtEachOther
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(12%)`
                        : isTyping || (password.length > 0 && !showPassword)
                          ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                          : `skewX(${blackPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  className="absolute flex gap-4 transition-all duration-700 ease-in-out sm:gap-5"
                  style={{
                    left:
                      password.length > 0 && showPassword
                        ? '10%'
                        : isLookingAtEachOther
                          ? '24%'
                          : `calc(16% + ${blackPos.faceX}px)`,
                    top:
                      password.length > 0 && showPassword
                        ? '10%'
                        : isLookingAtEachOther
                          ? '8%'
                          : `calc(10% + ${blackPos.faceY}px)`,
                  }}
                >
                  <EyeBall
                    size={16}
                    pupilSize={6}
                    maxDistance={4}
                    isBlinking={blackBlinking}
                    mousePosition={mousePosition}
                    forceLookX={
                      password.length > 0 && showPassword
                        ? -4
                        : isLookingAtEachOther
                          ? 0
                          : undefined
                    }
                    forceLookY={
                      password.length > 0 && showPassword
                        ? -4
                        : isLookingAtEachOther
                          ? -4
                          : undefined
                    }
                  />
                  <EyeBall
                    size={16}
                    pupilSize={6}
                    maxDistance={4}
                    isBlinking={blackBlinking}
                    mousePosition={mousePosition}
                    forceLookX={
                      password.length > 0 && showPassword
                        ? -4
                        : isLookingAtEachOther
                          ? 0
                          : undefined
                    }
                    forceLookY={
                      password.length > 0 && showPassword
                        ? -4
                        : isLookingAtEachOther
                          ? -4
                          : undefined
                    }
                  />
                </div>
              </div>

              <div
                ref={orangeRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '0%',
                  width: '40%',
                  height: '50%',
                  zIndex: 3,
                  backgroundColor: '#FF9B6B',
                  borderRadius: '120px 120px 0 0',
                  transform:
                    password.length > 0 && showPassword
                      ? 'skewX(0deg)'
                      : `skewX(${orangePos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  className="absolute flex gap-6 transition-all duration-200 ease-out sm:gap-8"
                  style={{
                    left:
                      password.length > 0 && showPassword
                        ? '20%'
                        : `calc(34% + ${orangePos.faceX || 0}px)`,
                    top:
                      password.length > 0 && showPassword
                        ? '42%'
                        : `calc(44% + ${orangePos.faceY || 0}px)`,
                  }}
                >
                  <Pupil
                    size={12}
                    maxDistance={5}
                    pupilColor="#2d2d2d"
                    mousePosition={mousePosition}
                    forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                    forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                  />
                  <Pupil
                    size={12}
                    maxDistance={5}
                    pupilColor="#2d2d2d"
                    mousePosition={mousePosition}
                    forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                    forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                  />
                </div>
              </div>

              <div
                ref={yellowRef}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: '57%',
                  width: '26%',
                  height: '58%',
                  backgroundColor: '#E8D754',
                  borderRadius: '70px 70px 0 0',
                  zIndex: 4,
                  transform:
                    password.length > 0 && showPassword
                      ? 'skewX(0deg)'
                      : `skewX(${yellowPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  className="absolute flex gap-5 transition-all duration-200 ease-out sm:gap-6"
                  style={{
                    left:
                      password.length > 0 && showPassword
                        ? '14%'
                        : `calc(34% + ${yellowPos.faceX || 0}px)`,
                    top:
                      password.length > 0 && showPassword
                        ? '14%'
                        : `calc(14% + ${yellowPos.faceY || 0}px)`,
                  }}
                >
                  <Pupil
                    size={12}
                    maxDistance={5}
                    pupilColor="#2d2d2d"
                    mousePosition={mousePosition}
                    forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                    forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                  />
                  <Pupil
                    size={12}
                    maxDistance={5}
                    pupilColor="#2d2d2d"
                    mousePosition={mousePosition}
                    forceLookX={password.length > 0 && showPassword ? -5 : undefined}
                    forceLookY={password.length > 0 && showPassword ? -4 : undefined}
                  />
                </div>
                <div
                  className="absolute h-1 rounded-full bg-[#2d2d2d] transition-all duration-200 ease-out"
                  style={{
                    left:
                      password.length > 0 && showPassword
                        ? '12%'
                        : `calc(28% + ${yellowPos.faceX || 0}px)`,
                    top:
                      password.length > 0 && showPassword
                        ? '56%'
                        : `calc(56% + ${yellowPos.faceY || 0}px)`,
                    width: '52%',
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export { AuthHero as LoginHero }
