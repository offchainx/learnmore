'use client'

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Sparkles } from 'lucide-react'

import {
  loginAction,
  signupAction,
  type AuthFormState,
} from '@/actions/user/auth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useReferralCodeAvailability } from '@/lib/hooks/useReferralCodeAvailability'

type AuthMode = 'login' | 'register'

type AuthAction = typeof loginAction | typeof signupAction

type AuthCopy = {
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  socialCta: string
  footerPrompt: string
  footerLink: string
  footerHref: string
}

type AuthIllustratedPageProps = {
  mode: AuthMode
  action: AuthAction
  redirectTo?: string
  resetSuccess?: boolean
  oauthError?: boolean
  initialReferralCode?: string
  referralError?: string
  initialUtmSource?: string
  initialUtmMedium?: string
  initialUtmCampaign?: string
}

type Position = {
  faceX: number
  faceY: number
  bodySkew: number
}

function useWindowMousePosition() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return mouse
}

function useRandomBlink(active: boolean) {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    if (!active) {
      setIsBlinking(false)
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let blinkResetId: ReturnType<typeof setTimeout> | null = null

    const scheduleBlink = () => {
      timeoutId = setTimeout(
        () => {
          if (cancelled) return

          setIsBlinking(true)
          blinkResetId = setTimeout(() => {
            if (cancelled) return

            setIsBlinking(false)
            scheduleBlink()
          }, 150)
        },
        Math.random() * 4000 + 3000
      )
    }

    scheduleBlink()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      if (blinkResetId) clearTimeout(blinkResetId)
    }
  }, [active])

  return isBlinking
}

function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = 'black',
  forceLookX,
  forceLookY,
  mouse,
  parentRef,
}: {
  size?: number
  maxDistance?: number
  pupilColor?: string
  forceLookX?: number
  forceLookY?: number
  mouse: { x: number; y: number }
  parentRef: RefObject<HTMLDivElement | null>
}) {
  const pupilRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!pupilRef.current || !parentRef.current) return

    if (forceLookX !== undefined && forceLookY !== undefined) {
      setPosition({ x: forceLookX, y: forceLookY })
      return
    }

    const pupil = pupilRef.current.getBoundingClientRect()
    const pupilCenterX = pupil.left + pupil.width / 2
    const pupilCenterY = pupil.top + pupil.height / 2
    const deltaX = mouse.x - pupilCenterX
    const deltaY = mouse.y - pupilCenterY
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)
    const angle = Math.atan2(deltaY, deltaX)

    setPosition({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    })
  }, [forceLookX, forceLookY, maxDistance, mouse.x, mouse.y, parentRef])

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

function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = 'white',
  pupilColor = 'black',
  isBlinking = false,
  forceLookX,
  forceLookY,
  mouse,
  parentRef,
}: {
  size?: number
  pupilSize?: number
  maxDistance?: number
  eyeColor?: string
  pupilColor?: string
  isBlinking?: boolean
  forceLookX?: number
  forceLookY?: number
  mouse: { x: number; y: number }
  parentRef: RefObject<HTMLDivElement | null>
}) {
  const eyeRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!eyeRef.current || !parentRef.current) return

    if (forceLookX !== undefined && forceLookY !== undefined) {
      setPosition({ x: forceLookX, y: forceLookY })
      return
    }

    const eye = eyeRef.current.getBoundingClientRect()
    const eyeCenterX = eye.left + eye.width / 2
    const eyeCenterY = eye.top + eye.height / 2
    const deltaX = mouse.x - eyeCenterX
    const deltaY = mouse.y - eyeCenterY
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)
    const angle = Math.atan2(deltaY, deltaX)

    setPosition({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    })
  }, [forceLookX, forceLookY, maxDistance, mouse.x, mouse.y, parentRef])

  return (
    <div
      ref={eyeRef}
      className="flex items-center justify-center rounded-full transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
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

function SubmitButton({
  children,
  loadingText,
}: {
  children: ReactNode
  loadingText: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size="xl"
      fullWidth
      isLoading={pending}
      loadingText={loadingText}
      className="rounded-full"
    >
      {children}
    </Button>
  )
}

export function AuthIllustratedPage({
  mode,
  action,
  redirectTo,
  resetSuccess,
  oauthError,
  initialReferralCode = '',
  referralError = '',
  initialUtmSource = '',
  initialUtmMedium = '',
  initialUtmCampaign = '',
}: AuthIllustratedPageProps) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    action,
    {}
  )
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false)
  const [isPurplePeeking, setIsPurplePeeking] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [referralCode, setReferralCode] = useState(initialReferralCode)
  const [oauthPending, setOauthPending] = useState(false)
  const [oauthMessage, setOauthMessage] = useState('')
  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const mouse = useWindowMousePosition()
  const purpleBlinking = useRandomBlink(mode === 'login' || mode === 'register')
  const blackBlinking = useRandomBlink(mode === 'login' || mode === 'register')
  const referralAvailability = useReferralCodeAvailability(referralCode)

  const copy: AuthCopy =
    mode === 'login'
      ? {
          eyebrow: 'Sign in',
          title: 'Welcome back!',
          description: 'Please enter your details',
          primaryCta: 'Log in',
          socialCta: 'Log in with Google',
          footerPrompt: "Don't have an account?",
          footerLink: 'Sign Up',
          footerHref: '/register',
        }
      : {
          eyebrow: 'Sign up',
          title: 'Create your account',
          description: 'Set up your profile in a minute',
          primaryCta: 'Create account',
          socialCta: 'Sign up with Google',
          footerPrompt: 'Already have an account?',
          footerLink: 'Sign In',
          footerHref: '/login',
        }

  useEffect(() => {
    setReferralCode(initialReferralCode)
  }, [initialReferralCode])

  useEffect(() => {
    if (!isTyping) {
      setIsLookingAtEachOther(false)
      return
    }

    setIsLookingAtEachOther(true)
    const timer = setTimeout(() => {
      setIsLookingAtEachOther(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [isTyping])

  useEffect(() => {
    if (!showPassword || password.length === 0) {
      setIsPurplePeeking(false)
      return
    }

    let cancelled = false
    let peekDelay: ReturnType<typeof setTimeout> | null = null
    let peekReset: ReturnType<typeof setTimeout> | null = null

    const schedulePeek = () => {
      peekDelay = setTimeout(
        () => {
          if (cancelled) return

          setIsPurplePeeking(true)
          peekReset = setTimeout(() => {
            if (cancelled) return

            setIsPurplePeeking(false)
            schedulePeek()
          }, 800)
        },
        Math.random() * 3000 + 2000
      )
    }

    schedulePeek()

    return () => {
      cancelled = true
      if (peekDelay) clearTimeout(peekDelay)
      if (peekReset) clearTimeout(peekReset)
    }
  }, [password, showPassword])

  const handleGoogleSignIn = async () => {
    setOauthPending(true)
    setOauthMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setOauthMessage(error.message)
      }
    } catch (error) {
      setOauthMessage(
        error instanceof Error ? error.message : 'Google 登录失败'
      )
    } finally {
      setOauthPending(false)
    }
  }

  const loginReferralCodeError =
    mode === 'register' &&
    referralCode.trim() &&
    referralAvailability.status === 'unavailable'
      ? referralAvailability.reason || '这个推荐码无效，请检查后重试。'
      : ''

  const shouldShowResetSuccess = mode === 'login' && resetSuccess
  const shouldShowOAuthError = oauthError || Boolean(oauthMessage)

  const calculatePosition = (
    ref: RefObject<HTMLDivElement | null>
  ): Position => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 3
    const deltaX = mouse.x - centerX
    const deltaY = mouse.y - centerY

    return {
      faceX: Math.max(-15, Math.min(15, deltaX / 20)),
      faceY: Math.max(-10, Math.min(10, deltaY / 30)),
      bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
    }
  }

  const purplePos = calculatePosition(purpleRef)
  const blackPos = calculatePosition(blackRef)
  const orangePos = calculatePosition(orangeRef)
  const yellowPos = calculatePosition(yellowRef)

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overflow-x-hidden bg-[#f5f3ee] text-slate-950">
      <div className="grid min-h-[100dvh] grid-cols-1 laptop:grid-cols-[1.02fr_0.98fr]">
        <section className="relative flex min-h-[38vh] flex-col justify-between overflow-hidden border-b border-slate-800/60 bg-[linear-gradient(180deg,#121318_0%,#181b22_100%)] px-5 py-5 text-slate-50 sm:min-h-[42vh] sm:px-8 sm:py-7 laptop:min-h-[100dvh] laptop:border-b-0 laptop:px-10 laptop:py-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-70" />
            <div className="absolute left-[-8%] top-[-12%] size-[22rem] rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-[-18%] right-[-10%] size-[28rem] rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/8 flex size-11 items-center justify-center rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/55">
                LearnMore
              </p>
              <p className="text-sm text-white/75">{copy.eyebrow}</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center py-8 laptop:py-14">
            <div className="relative h-[clamp(280px,56vw,420px)] w-full max-w-[560px]">
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[560px] -translate-x-1/2 -translate-y-1/2 scale-[0.62] sm:scale-[0.8] md:scale-90 laptop:scale-100">
                <div
                  ref={purpleRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '72px',
                    width: '176px',
                    height:
                      isTyping || (password.length > 0 && !showPassword)
                        ? '430px'
                        : '392px',
                    backgroundColor: '#6c3ff5',
                    borderRadius: '12px 12px 0 0',
                    zIndex: 1,
                    transform:
                      password.length > 0 && showPassword
                        ? 'skewX(0deg)'
                        : isTyping || (password.length > 0 && !showPassword)
                          ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                          : `skewX(${purplePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div
                    className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                    style={{
                      left:
                        password.length > 0 && showPassword
                          ? '22px'
                          : isLookingAtEachOther
                            ? '56px'
                            : `${46 + purplePos.faceX}px`,
                      top:
                        password.length > 0 && showPassword
                          ? '36px'
                          : isLookingAtEachOther
                            ? '68px'
                            : `${40 + purplePos.faceY}px`,
                    }}
                  >
                    <EyeBall
                      size={18}
                      pupilSize={7}
                      maxDistance={5}
                      eyeColor="white"
                      pupilColor="#2d2d2d"
                      isBlinking={purpleBlinking}
                      forceLookX={
                        password.length > 0 && showPassword
                          ? isPurplePeeking
                            ? 4
                            : -4
                          : isLookingAtEachOther
                            ? 3
                            : undefined
                      }
                      forceLookY={
                        password.length > 0 && showPassword
                          ? isPurplePeeking
                            ? 5
                            : -4
                          : isLookingAtEachOther
                            ? 4
                            : undefined
                      }
                      mouse={mouse}
                      parentRef={purpleRef}
                    />
                    <EyeBall
                      size={18}
                      pupilSize={7}
                      maxDistance={5}
                      eyeColor="white"
                      pupilColor="#2d2d2d"
                      isBlinking={purpleBlinking}
                      forceLookX={
                        password.length > 0 && showPassword
                          ? isPurplePeeking
                            ? 4
                            : -4
                          : isLookingAtEachOther
                            ? 3
                            : undefined
                      }
                      forceLookY={
                        password.length > 0 && showPassword
                          ? isPurplePeeking
                            ? 5
                            : -4
                          : isLookingAtEachOther
                            ? 4
                            : undefined
                      }
                      mouse={mouse}
                      parentRef={purpleRef}
                    />
                  </div>
                </div>

                <div
                  ref={blackRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '238px',
                    width: '126px',
                    height: '316px',
                    backgroundColor: '#2d2d2d',
                    borderRadius: '10px 10px 0 0',
                    zIndex: 2,
                    transform:
                      password.length > 0 && showPassword
                        ? 'skewX(0deg)'
                        : isLookingAtEachOther
                          ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                          : isTyping || (password.length > 0 && !showPassword)
                            ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                            : `skewX(${blackPos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div
                    className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                    style={{
                      left:
                        password.length > 0 && showPassword
                          ? '12px'
                          : isLookingAtEachOther
                            ? '34px'
                            : `${26 + blackPos.faceX}px`,
                      top:
                        password.length > 0 && showPassword
                          ? '30px'
                          : isLookingAtEachOther
                            ? '14px'
                            : `${32 + blackPos.faceY}px`,
                    }}
                  >
                    <EyeBall
                      size={16}
                      pupilSize={6}
                      maxDistance={4}
                      eyeColor="white"
                      pupilColor="#2d2d2d"
                      isBlinking={blackBlinking}
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
                      mouse={mouse}
                      parentRef={blackRef}
                    />
                    <EyeBall
                      size={16}
                      pupilSize={6}
                      maxDistance={4}
                      eyeColor="white"
                      pupilColor="#2d2d2d"
                      isBlinking={blackBlinking}
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
                      mouse={mouse}
                      parentRef={blackRef}
                    />
                  </div>
                </div>

                <div
                  ref={orangeRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '0px',
                    width: '240px',
                    height: '202px',
                    zIndex: 3,
                    backgroundColor: '#ff9a6b',
                    borderRadius: '120px 120px 0 0',
                    transform:
                      password.length > 0 && showPassword
                        ? 'skewX(0deg)'
                        : `skewX(${orangePos.bodySkew || 0}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div
                    className="absolute flex gap-8 transition-all duration-200 ease-out"
                    style={{
                      left:
                        password.length > 0 && showPassword
                          ? '50px'
                          : `${82 + (orangePos.faceX || 0)}px`,
                      top:
                        password.length > 0 && showPassword
                          ? '86px'
                          : `${90 + (orangePos.faceY || 0)}px`,
                    }}
                  >
                    <Pupil
                      size={12}
                      maxDistance={5}
                      pupilColor="#2d2d2d"
                      forceLookX={
                        password.length > 0 && showPassword ? -5 : undefined
                      }
                      forceLookY={
                        password.length > 0 && showPassword ? -4 : undefined
                      }
                      mouse={mouse}
                      parentRef={orangeRef}
                    />
                    <Pupil
                      size={12}
                      maxDistance={5}
                      pupilColor="#2d2d2d"
                      forceLookX={
                        password.length > 0 && showPassword ? -5 : undefined
                      }
                      forceLookY={
                        password.length > 0 && showPassword ? -4 : undefined
                      }
                      mouse={mouse}
                      parentRef={orangeRef}
                    />
                  </div>
                </div>

                <div
                  ref={yellowRef}
                  className="absolute bottom-0 transition-all duration-700 ease-in-out"
                  style={{
                    left: '306px',
                    width: '142px',
                    height: '236px',
                    backgroundColor: '#e8d754',
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
                    className="absolute flex gap-6 transition-all duration-200 ease-out"
                    style={{
                      left:
                        password.length > 0 && showPassword
                          ? '20px'
                          : `${52 + (yellowPos.faceX || 0)}px`,
                      top:
                        password.length > 0 && showPassword
                          ? '36px'
                          : `${40 + (yellowPos.faceY || 0)}px`,
                    }}
                  >
                    <Pupil
                      size={12}
                      maxDistance={5}
                      pupilColor="#2d2d2d"
                      forceLookX={
                        password.length > 0 && showPassword ? -5 : undefined
                      }
                      forceLookY={
                        password.length > 0 && showPassword ? -4 : undefined
                      }
                      mouse={mouse}
                      parentRef={yellowRef}
                    />
                    <Pupil
                      size={12}
                      maxDistance={5}
                      pupilColor="#2d2d2d"
                      forceLookX={
                        password.length > 0 && showPassword ? -5 : undefined
                      }
                      forceLookY={
                        password.length > 0 && showPassword ? -4 : undefined
                      }
                      mouse={mouse}
                      parentRef={yellowRef}
                    />
                  </div>
                  <div
                    className="absolute h-[4px] w-20 rounded-full bg-[#2d2d2d] transition-all duration-200 ease-out"
                    style={{
                      left:
                        password.length > 0 && showPassword
                          ? '10px'
                          : `${40 + (yellowPos.faceX || 0)}px`,
                      top:
                        password.length > 0 && showPassword
                          ? '90px'
                          : `${88 + (yellowPos.faceY || 0)}px`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden items-center gap-8 text-sm text-slate-200/65 laptop:flex">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-white"
            >
              Contact
            </Link>
          </div>
        </section>

        <section className="relative flex min-h-[62vh] items-center justify-center bg-[#f7f6f2] px-5 py-8 text-slate-950 sm:px-8 laptop:min-h-[100dvh] laptop:px-10 laptop:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.85),rgba(248,246,240,1))]" />

          <div className="relative z-10 w-full max-w-[480px]">
            <div className="mb-8 flex items-center gap-2 laptop:hidden">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_10px_20px_-14px_rgba(15,23,42,0.25)]">
                <Sparkles className="size-5" />
              </div>
              <span className="text-base font-semibold tracking-tight">
                LearnMore
              </span>
            </div>

            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {copy.eyebrow}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                {copy.title}
              </h1>
              <p className="mx-auto mt-3 max-w-[28rem] text-base leading-relaxed text-slate-500">
                {copy.description}
              </p>
            </div>

            <form action={formAction} className="space-y-5">
              <input type="hidden" name="redirectTo" value={redirectTo || ''} />
              {mode === 'register' ? (
                <>
                  <input
                    type="hidden"
                    name="utm_source"
                    value={initialUtmSource}
                  />
                  <input
                    type="hidden"
                    name="utm_medium"
                    value={initialUtmMedium}
                  />
                  <input
                    type="hidden"
                    name="utm_campaign"
                    value={initialUtmCampaign}
                  />
                </>
              ) : null}
              <input
                type="hidden"
                name="rememberMe"
                value={rememberMe ? 'true' : 'false'}
              />

              {shouldShowResetSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  密码已更新，请使用新密码重新登录。
                </div>
              ) : null}

              {shouldShowOAuthError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {oauthMessage || 'Google 登录失败，请稍后重试。'}
                </div>
              ) : null}

              <div className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.18)] sm:p-7">
                <div className="space-y-4">
                  {mode === 'register' ? (
                    <FieldBlock label="用户名" htmlFor="username">
                      <Input
                        id="username"
                        name="username"
                        placeholder="输入你的昵称"
                        required
                        autoComplete="nickname"
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 text-[15px] placeholder:text-slate-400 focus-visible:ring-slate-300"
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                      />
                    </FieldBlock>
                  ) : null}

                  <FieldBlock label="Email" htmlFor="email">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={
                        mode === 'login' ? 'anna@gmail.com' : 'name@example.com'
                      }
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-white px-4 text-[15px] placeholder:text-slate-400 focus-visible:ring-slate-300"
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                    />
                  </FieldBlock>

                  {mode === 'register' ? (
                    <FieldBlock
                      label="推荐码（选填）"
                      htmlFor="referralCode"
                      helperText="如果你通过推荐链接进入，这里会自动带入；你也可以手动修改或留空。"
                    >
                      <Input
                        id="referralCode"
                        name="referralCode"
                        placeholder="例如 LMQ8A2K1"
                        value={referralCode}
                        onChange={(event) =>
                          setReferralCode(event.target.value)
                        }
                        autoCapitalize="characters"
                        spellCheck={false}
                        className={cn(
                          'h-12 rounded-xl border-slate-200 bg-white px-4 text-[15px] placeholder:text-slate-400 focus-visible:ring-slate-300',
                          loginReferralCodeError
                            ? 'border-rose-300 focus-visible:ring-rose-300'
                            : undefined
                        )}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                      />
                      {referralAvailability.status === 'checking' &&
                      referralCode.trim() ? (
                        <p className="text-xs text-slate-500">
                          正在验证推荐码...
                        </p>
                      ) : null}
                      {loginReferralCodeError ? (
                        <p className="text-xs font-medium text-rose-600">
                          {loginReferralCodeError}
                        </p>
                      ) : null}
                      {referralError ? (
                        <p className="text-xs font-medium text-rose-600">
                          {referralError === 'INVALID_REFERRAL_CODE'
                            ? '推荐链接无效，请检查后重试。'
                            : referralError === 'REFERRAL_NOT_FOUND'
                              ? '未找到对应的推荐码，请确认后再注册。'
                              : '推荐码暂时不可用，请稍后重试。'}
                        </p>
                      ) : null}
                    </FieldBlock>
                  ) : null}

                  <FieldBlock
                    label="Password"
                    htmlFor="password"
                    helperText={
                      mode === 'register' ? '至少 6 位字符' : undefined
                    }
                  >
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete={
                          mode === 'login' ? 'current-password' : 'new-password'
                        }
                        minLength={mode === 'register' ? 6 : undefined}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-12 text-[15px] placeholder:text-slate-400 focus-visible:ring-slate-300"
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:text-slate-700"
                        aria-label={showPassword ? '隐藏密码' : '显示密码'}
                      >
                        {showPassword ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                  </FieldBlock>

                  {mode === 'login' ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember-me"
                          checked={rememberMe}
                          onCheckedChange={(checked) =>
                            setRememberMe(Boolean(checked))
                          }
                        />
                        <Label
                          htmlFor="remember-me"
                          className="cursor-pointer text-sm font-normal text-slate-700"
                        >
                          Remember for 30 days
                        </Label>
                      </div>
                      <Link
                        href="/reset-password"
                        className="text-sm font-medium text-slate-900 transition-colors hover:text-slate-600"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  ) : null}

                  {state.error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {state.error}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 space-y-4">
                  <SubmitButton
                    loadingText={
                      mode === 'login' ? 'Signing in...' : 'Creating account...'
                    }
                  >
                    {copy.primaryCta}
                  </SubmitButton>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                        or
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    isLoading={oauthPending}
                    loadingText="Redirecting..."
                    onClick={handleGoogleSignIn}
                    className="h-12 rounded-full border-slate-200 bg-white text-slate-900 shadow-none hover:bg-slate-50"
                  >
                    <Mail className="size-5" />
                    {copy.socialCta}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
              {copy.footerPrompt}{' '}
              <Link
                href={copy.footerHref}
                className="font-semibold text-slate-950 hover:underline"
              >
                {copy.footerLink}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function FieldBlock({
  label,
  htmlFor,
  helperText,
  children,
}: {
  label: string
  htmlFor: string
  helperText?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-slate-900">
        {label}
      </Label>
      {children}
      {helperText ? (
        <p className="text-xs leading-relaxed text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

export function LoginForm({
  redirectTo,
  resetSuccess,
  oauthError,
}: {
  redirectTo?: string
  resetSuccess?: boolean
  oauthError?: boolean
}) {
  return (
    <AuthIllustratedPage
      mode="login"
      action={loginAction}
      redirectTo={redirectTo}
      resetSuccess={resetSuccess}
      oauthError={oauthError}
    />
  )
}

export function RegisterForm({
  initialReferralCode = '',
  referralError = '',
  initialUtmSource = '',
  initialUtmMedium = '',
  initialUtmCampaign = '',
  oauthError,
}: {
  initialReferralCode?: string
  referralError?: string
  initialUtmSource?: string
  initialUtmMedium?: string
  initialUtmCampaign?: string
  oauthError?: boolean
}) {
  return (
    <AuthIllustratedPage
      mode="register"
      action={signupAction}
      initialReferralCode={initialReferralCode}
      referralError={referralError}
      initialUtmSource={initialUtmSource}
      initialUtmMedium={initialUtmMedium}
      initialUtmCampaign={initialUtmCampaign}
      oauthError={oauthError}
    />
  )
}
