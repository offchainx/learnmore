'use client'

import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, BookOpenCheck, Check, CircleHelp, FileText, PencilLine, ChartNoAxesColumnIncreasing, ChevronRight, Clock3, CircleAlert, Axis3D, ChartSpline, SlidersHorizontal } from 'lucide-react'
import { handwriting } from './typography'
import s from './AccumulationCards.module.css'

const names = ['理解的变化', '接续下一步', '看清已掌握']
const records = [
  { Icon: FileText, title: '学过：开口方向', body: '浏览了二次函数开口方向的讲解', time: '10:24', tone: 'blue' },
  { Icon: PencilLine, title: '练过：负系数判断', body: '完成了相关题目的练习', time: '14:08', tone: 'green' },
  { Icon: CircleHelp, title: '问过：为什么开口向下', body: '留下了这个具体的疑问', time: '16:17', tone: 'amber' },
]
const nextSteps = [
  { Icon: Check, title: '已理解的，不必从头看', body: '接着已经掌握的内容，把时间用在更需要的地方', tone: 'green' },
  { Icon: ChartNoAxesColumnIncreasing, title: '还不稳的，再换题巩固', body: '结合学习记录，找到需要继续练习的地方', tone: 'amber' },
  { Icon: BookOpen, title: '新内容，接着已有基础学', body: '从这一次的理解出发，走向下一个知识点', tone: 'blue' },
]
const knowledge = [
  { Icon: ChartSpline, Status: Check, name: '开口方向', status: '已能独立判断', detail: '已阅读 · 已练习 · 已回看', tone: 'green', iconTone: 'blue' },
  { Icon: SlidersHorizontal, Status: CircleAlert, name: '系数变化', status: '还需巩固', detail: '已阅读 · 练习中发现疑问', tone: 'amber', iconTone: 'amber' },
  { Icon: Axis3D, Status: Clock3, name: '顶点位置', status: '尚未学习', detail: '接着已有基础继续', tone: 'muted', iconTone: 'muted' },
]

export function AccumulationCards() {
  const [active, setActive] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  function move(delta: number) { setActive(v => (v + delta + 3) % 3) }
  return <section id="learning-accumulation" className={s.section} aria-label="学习积累">
    <div className={s.top}>
      <p className={`${handwriting.className} ${s.kicker}`}>03 · 每一步，都算数</p>
      <div className={s.selectors} role="group" aria-label="选择积累故事">{names.map((name, i) => <button type="button" key={name} aria-pressed={active === i} onClick={() => setActive(i)}><span>0{i + 1}</span>{name}</button>)}</div>
    </div>
    <div className={s.card} data-story={active} role="region" aria-roledescription="轮播" aria-label="学习积累故事" tabIndex={0}
      onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === 'ArrowRight') { e.preventDefault(); move(1) } if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) } }}
      onTouchStart={e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
      onTouchEnd={e => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x; const dy = e.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1); touch.current = null }}
      onTouchCancel={() => { touch.current = null }}>
      {active === 0 && <>
        <header className={s.historyHeading}><h2>以前卡住的，成为下一次的基础。</h2><p>每次学习，都留下能接着往前走的线索。</p></header>
        <div className={s.history}>
          <article><span className={s.sample}>学习过程示例</span><h3>第一次：<em>发现疑问</em></h3><p className={s.topic}>二次函数 · 开口方向</p><div className={s.historyBody}><CircleHelp className={s.questionIcon} strokeWidth={1.3} /><p>负系数时，我还分不清开口方向。</p></div></article>
          <ArrowRight className={s.connector} aria-hidden="true" />
          <article><span className={s.sample}>学习过程示例</span><h3>再一次：<em>弄懂原因</em></h3><p className={s.topic}>二次函数 · 开口方向</p><div className={s.historyBody}><BookOpenCheck className={s.bookIcon} strokeWidth={1.4} /><p>回看讲解，再试一道题，检验自己的理解。</p></div></article>
          <ArrowRight className={s.connector} aria-hidden="true" />
          <article><span className={s.sample}>学习过程示例</span><h3>下一次：<em>接着巩固</em></h3><p className={s.topic}>二次函数 · 开口方向</p><p className={s.historyText}>保留这次的卡点，下一次从不同系数的判断继续。</p><div className={s.reviewRow}><FileText size={27} /><span>巩固开口方向</span><ChevronRight size={20} /></div></article>
        </div>
        <p className={s.takeaway}>积累的不只是题数，还有理解的变化。</p>
      </>}
      {active === 1 && <>
        <header className={s.flowHeading}><h2>你走过的每一步，<br />都会用在下一步。</h2><p>Learnbank.ai 会把你学过的、练过的、问过的，一步步整理起来，<br className={s.desktopBreak} />让下一次学习，接着已有的基础继续。</p></header>
        <div className={s.flow}>
          <div className={s.records}>{records.map(({ Icon, title, body, time, tone }) => <div key={title}><span className={s.iconCircle} data-tone={tone}><Icon size={26} /></span><span className={s.recordText}><strong>{title}</strong><small>{body}</small></span><span className={s.timestamp}>示例数据<small>今天 {time}</small></span></div>)}</div>
          <div className={s.analysisBridge} aria-hidden="true"><div className={s.wires}><span /><span /><span /></div><div className={s.analysis}><ChartNoAxesColumnIncreasing size={34} /><strong>学习分析</strong></div><ArrowRight className={s.outArrow} strokeWidth={1.2} /></div>
          <article className={s.next}><div className={s.panelMeta}><span>基于你的学习记录</span><span>示例数据</span></div><h3>下一次，从这里继续</h3>{nextSteps.map(({ Icon, title, body, tone }) => <div className={s.nextRow} key={title}><span className={s.iconCircle} data-tone={tone}><Icon size={26} /></span><span><strong>{title}</strong><small>{body}</small></span><ChevronRight size={20} /></div>)}</article>
        </div>
        <div className={s.flowFooter}><a href="#learning-loop" className={s.primary}>看看学习怎样接起来 <ArrowRight size={22} /></a><p>让每一次学习，都成为下一次的起点。</p></div>
      </>}
      {active === 2 && <>
        <header className={s.knowledgeHeading}><h2>学得越多，越看得清自己。</h2><p>每一次学习和练习，都让你的知识档案更完整。</p></header>
        <div className={s.knowledge}>
          <ol>{[{ title: '读懂概念', body: '从基础讲解开始，建立清晰的知识认知。' }, { title: '独立作答', body: '在练习中应用所学，发现真实的掌握情况。' }, { title: '回看疑问', body: '针对不确定的内容，随时回看，查漏补缺。' }].map((item, i) => <li key={item.title}><span className={s.timelineDot} data-active={i === 0} /><strong>{item.title}</strong><span>{item.body}</span></li>)}</ol>
          <article><div className={s.knowledgeHeader}><h3>我的二次函数学习记录</h3><span>示例数据</span><small>初中数学</small></div>{knowledge.map(({ Icon, Status, name, status, detail, tone, iconTone }) => <div className={s.knowledgeRow} key={name}><span className={s.knowledgeIcon} data-tone={iconTone}><Icon size={34} strokeWidth={1.4} /></span><div className={s.knowledgeText}><strong>{name}</strong><small>{detail}</small></div><span className={s.status} data-tone={tone}><Status size={17} />{status}</span></div>)}</article>
        </div><div className={s.knowledgeFooter}><p>知道已经会了什么，也知道下一步该补哪里。</p><a href="#beta" className={s.primary}>免费申请内测 <ArrowRight size={22} /></a></div>
      </>}
    </div>
    <div className={s.controls}><span role="status" aria-live="polite">0{active + 1} / 03 · {names[active]}</span><div><button type="button" aria-label="上一个积累故事" onClick={() => move(-1)}><ArrowLeft size={20} /></button><button type="button" aria-label="下一个积累故事" onClick={() => move(1)}><ArrowRight size={20} /></button></div></div>
  </section>
}
