'use client'

import Image from 'next/image'
import Link from 'next/link'
import { editorial, handwriting } from './typography'
import { BrandWordmark } from './BrandWordmark'
import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, ChevronRight, FlaskConical, Globe2, Landmark, Menu, Pause, Play, X } from 'lucide-react'
import styles from './LandingHero.module.css'


const slides = [
  {
    label: '把不会的，学会',
    eyebrow: '为马来西亚独中生而做 · 初一至初三',
    title: ['把不会的，', '一点点学会。'],
    description: '从一个知识点开始。读懂、动手，把卡住的地方一点点弄明白。',
    image: 'hero-learning.png',
    alt: '暖色校园情境：两位中学生在阳光下共同学习',
    note: '从一个知识点开始',
  },
  {
    label: '让进步，接着发生',
    eyebrow: '学过的每一点，都在托起下一步',
    title: ['每次复习，', '都接着上次的进步。'],
    description: '今天弄懂的，成为下次解题的底气。今天卡住的，成为下次练习的重点。',
    image: 'hero-progress.png',
    alt: '暖色校园情境：一位抱着书的中学生沿台阶向上走',
    note: '每一步，都有之前的积累',
  },
  {
    label: '让家长，看懂努力',
    eyebrow: '给家长 · 关心孩子，也看懂他的努力',
    title: ['孩子学了什么，', '更要看懂他卡在哪。'],
    description: '坐在书桌前很久，到底哪里还不会？从学习过程里，找到陪他往前走的线索。',
    image: 'hero-parent.png',
    alt: '暖色家庭情境：母亲耐心听孩子讲解自己的练习',
    note: '多一点了解，少一点着急',
  },
] as const

const subjects = [
  { label: '数学', Icon: BookOpen },
  { label: '科学', Icon: FlaskConical },
  { label: '历史', Icon: Landmark },
  { label: '地理', Icon: Globe2 },
]

export function LandingHeader({ home = true }: { home?: boolean }) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const links = [
    { label: '怎样学习', href: home ? '#learning-loop' : '/#learning-loop' },
    { label: '学习科目', href: '/subjects' },
    { label: '价格方案', href: '/pricing', pending: true },
    { label: '内测计划', href: home ? '#beta' : '/#beta' },
  ]

  return (
    <header className={styles.header} data-testid="landing-header">
      <a href="#main-content" className={styles.skip}>跳到主要内容</a>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="Learnbank.ai 首页">
          <Image src="/images/landing-r2/learnbank-logo.jpeg" alt="" width={44} height={44} priority />
          <BrandWordmark />
        </Link>
        <nav className={styles.desktopNav} aria-label="官网导航">
          {links.map(link => <Link href={link.href} key={link.label}><span className={styles.navLabel}>{link.label}{link.pending && <span className={styles.pendingBadge}>待确认</span>}</span></Link>)}
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.headerCta} href={home ? "#beta" : "/#beta"}>免费申请内测 <ArrowRight size={16} aria-hidden="true" /></a>
          <button ref={menuButton} className={styles.menuButton} aria-label={open ? '关闭导航' : '打开导航'} aria-expanded={open} aria-controls="landing-mobile-menu" onClick={() => setOpen(!open)}>
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="landing-mobile-menu" aria-label="手机官网导航" className={styles.mobileNav} onKeyDown={event => {
          if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus() }
        }}>
          {links.map(link => <Link href={link.href} key={link.label} onClick={() => setOpen(false)}><span className={styles.navLabel}>{link.label}{link.pending && <span className={styles.pendingBadge}>待确认</span>}</span><ChevronRight size={18} aria-hidden="true" /></Link>)}
        </nav>
      )}
    </header>
  )
}

export function LandingHero() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const slide = slides[active]

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!playing || hovering || reducedMotion) return
    const interval = window.setInterval(() => {
      if (!document.hidden) setActive(current => (current + 1) % slides.length)
    }, 8000)
    return () => window.clearInterval(interval)
  }, [playing, hovering, reducedMotion])

  const select = (index: number) => {
    setPlaying(false)
    setActive((index + slides.length) % slides.length)
  }

  return (
    <section className={styles.hero} aria-roledescription="轮播" aria-label="Learnbank.ai 学习故事" data-testid="landing-hero" data-slide={active + 1}
      onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
      onFocusCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPlaying(false) }}
      onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowLeft') { event.preventDefault(); select(active - 1) }
        if (event.key === 'ArrowRight') { event.preventDefault(); select(active + 1) }
      }}
      onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY } }}
      onTouchEnd={event => {
        if (!touch.current) return
        const dx = event.changedTouches[0].clientX - touch.current.x
        const dy = event.changedTouches[0].clientY - touch.current.y
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) select(active + (dx < 0 ? 1 : -1))
        touch.current = null
      }}>
      <div className={styles.photograph}>
        {slides.map((item, index) => (
          <Image key={item.image} className={`${styles.photo} ${active === index ? styles.photoActive : ''}`} src={`/images/landing-r2/${item.image}`} alt={active === index ? item.alt : ''} aria-hidden={active !== index} fill sizes="100vw" priority={index === 0} />
        ))}
      </div>
      <div className={styles.heroInner}>
        <div className={styles.copy}>
          <p className={`${handwriting.className} ${styles.eyebrow}`}><span>{slide.eyebrow}</span><svg className={styles.handUnderline} viewBox="0 0 360 15" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12 Q152 -1 356 5" fill="none" stroke="#edbd36" strokeWidth="4" strokeLinecap="round" /><path d="M22 12 Q195 4 338 7" fill="none" stroke="#edbd36" strokeWidth="1.4" strokeLinecap="round" /></svg></p>
          <div aria-live={playing && !reducedMotion ? 'off' : 'polite'} aria-atomic="true" className={styles.titleArea}>
            <h1 className={`${editorial.className} ${styles.title}`}>
              {slide.title.map(line => <span key={line}>{line}</span>)}
            </h1>
            <p className={styles.description}>{slide.description}</p>
          </div>
          <div className={styles.actions}>
            <a href="#beta" className={styles.primaryCta}>免费申请内测 <ArrowRight size={21} aria-hidden="true" /></a>
            <a href="#learning-loop" className={styles.secondaryCta}>看看怎样学习 <ChevronRight size={17} aria-hidden="true" /></a>
          </div>
          <p className={styles.betaNote}>首批 30 位种子用户 · 入选后免费体验 2 周</p>
          <div className={styles.subjects} aria-label="内测科目">
            {subjects.map(({ label, Icon }) => <span key={label}><Icon size={18} strokeWidth={1.7} aria-hidden="true" />{label}</span>)}
          </div>
        </div>
        <p className={styles.photoNote}>{slide.note}</p>
        {active === 0 && (
          <figure className={styles.appPreview} aria-label="数学章节列表示例">
            <Image src="/images/landing-r3-refinement/hero-chapters-phone.png" alt="Learnbank.ai 手机数学章节列表：学习概览、二次函数、圆与切线和一次函数，数据为示例" width={1024} height={1536} sizes="(min-width: 1700px) 400px, 340px" />
          </figure>
        )}
      </div>
      <div className={styles.controls}>
        <div className={styles.slidePicker} aria-label="选择学习故事">
          {slides.map((item, index) => <button key={item.label} onClick={() => select(index)} aria-label={`第 ${index + 1} 张：${item.label}`} aria-pressed={index === active} className={index === active ? styles.selected : ''}><span>0{index + 1}</span><span className={styles.pickerLabel}>{item.label}</span></button>)}
        </div>
        <div className={styles.arrows}>
          <span className={styles.counter} aria-hidden="true">0{active + 1} <span>/ 03</span></span>
          <button aria-label="上一张" onClick={() => select(active - 1)}><ArrowLeft size={18} /></button>
          <button aria-label="下一张" onClick={() => select(active + 1)}><ArrowRight size={18} /></button>
          {!reducedMotion && <button aria-label={playing ? '暂停自动轮播' : '播放自动轮播'} aria-pressed={playing} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>}
        </div>
      </div>
      <a href="#learning-loop" className={styles.scrollHint} aria-label="向下了解学习方式"><ArrowDown size={15} /> 往下，看看怎么学</a>
    </section>
  )
}
