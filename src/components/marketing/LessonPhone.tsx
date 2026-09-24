'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Check, X, RotateCcw } from 'lucide-react'
import s from './LessonPhone.module.css'

export const lessonModes = [
  { title: '热身', description: '从一个熟悉的情境开始' },
  { title: '讲解', description: '逐段展开，把概念读明白' },
  { title: '定义', description: '抓住概念的关键条件' },
  { title: '公式', description: '理解符号与公式的关系' },
  { title: '例题', description: '跟着步骤，看看怎么用' },
  { title: '检查点', description: '自己选，再看即时反馈' },
  { title: '判断', description: '检验一个容易混淆的概念' },
  { title: '配对', description: '把表达式和性质连起来' },
  { title: '回顾', description: '带走这一课的关键点' },
] as const

const reading = [
  { title: '抛起的球，为什么会落下来？', chunks: ['把球向上抛：它先升高，慢下来，再落下。', '如果把时间与高度画出来，会得到一条弯曲的线，而不是直线。', '今天，我们认识这种曲线：抛物线。'] },
  { title: '二次函数，是什么样的？', chunks: ['在 y = ax² + bx + c 中，x 的最高次数是 2，且 a ≠ 0。', '它的图像是一条抛物线。先看 a 的符号，就能判断开口方向。', 'a > 0 时开口向上；a < 0 时开口向下。'] },
  { title: '定义里，不能漏掉什么？', chunks: ['形如 y = ax² + bx + c（a ≠ 0）的函数，叫作二次函数。', '如果 a = 0，二次项就消失了，因此不再是二次函数。'] },
  { title: '读懂每一个符号。', chunks: ['a 是二次项系数，b 是一次项系数，c 是常数项。', 'a 的正负决定开口方向。令 x = 0，就能得到 y = c。', '所以，图像与 y 轴的交点是（0，c）。'] },
  { title: '把公式用在一道题里。', chunks: ['例：y = 2x² − 8x + 5。找出 a、b、c，并判断开口方向。', '对照一般式：a = 2，b = −8，c = 5。', '因为 a = 2 > 0，所以图像开口向上；与 y 轴交于（0，5）。'] },
]
const recap = ['二次函数的一般式：y = ax² + bx + c，且 a ≠ 0。', '判断开口方向，先看 a 的符号。', '令 x = 0，得到与 y 轴的交点（0，c）。']
const pairs = [{ left: 'y = x² + 3', right: '开口向上，交点（0，3）' }, { left: 'y = −x²', right: '开口向下，经过原点' }, { left: 'y = 2x² − 5', right: '开口向上，交点（0，−5）' }]

function Asset({ name, size = 22 }: { name: string; size?: number }) {
  return <Image src={`/images/landing-r3/lesson/l04-${name}.png`} alt="" width={size} height={size} />
}

export function LessonPhone({ mode, onModeChange }: { mode: number; onModeChange: (mode: number) => void }) {
  const [visible, setVisible] = useState(mode === 1 ? 2 : 1)
  const [answer, setAnswer] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [left, setLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Record<number, number>>({})
  const [ask, setAsk] = useState(false)
  const body = useRef<HTMLDivElement>(null)
  const isChoice = mode === 5 || mode === 6
  const isMatch = mode === 7
  const chunks = mode < 5 ? reading[mode].chunks : recap
  const correct = isMatch ? pairs.every((_, i) => matches[i] === i) : answer === 0
  const options = mode === 5 ? ['向上', '向下', '向左', '无法判断'] : ['正确', '错误']
  const title = mode < 5 ? reading[mode].title : mode === 5 ? '当 a > 0 时，图像开口方向是？' : mode === 6 ? '图像与 y 轴的交点是（0，c）。' : mode === 7 ? '把函数与它的性质配起来。' : '这一课，记住这三点。'
  useEffect(() => { if (checked || visible > 1 || ask) body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' }) }, [checked, visible, ask])
  function change(next: number) { setVisible(1); setAnswer(null); setChecked(false); setMatches({}); setLeft(null); setAsk(false); onModeChange(next) }
  function advance() {
    if ((isChoice || isMatch) && !checked) { setChecked(true); return }
    if ((isChoice || isMatch) && !correct) { setChecked(false); setAnswer(null); setMatches({}); setLeft(null); return }
    if (!isChoice && !isMatch && visible < chunks.length) { setVisible(visible + 1); return }
    change((mode + 1) % lessonModes.length)
  }
  const label = (isChoice || isMatch) ? !checked ? '检查' : !correct ? '再试一次' : '继续' : visible < chunks.length ? '继续 ⌄' : mode === 8 ? '再体验一次' : '下一步'
  return <div className={s.phone} aria-label="手机微课体验">
    <div className={s.toolbar}>
      <button type="button" aria-label="重新开始微课" onClick={() => change(0)}><RotateCcw size={19} /></button>
      <button type="button" aria-label="上一个微课模式" disabled={mode === 0} onClick={() => change(mode - 1)}><ChevronLeft size={22} /></button>
      <div className={s.progress} aria-label={`第 ${mode + 1} 步，共 9 步`}>{lessonModes.map((m,i)=><span key={m.title} data-done={i <= mode} />)}</div>
      <button type="button" className={s.ask} onClick={()=>setAsk(!ask)} aria-expanded={ask}><Asset name="ask-chat-bubble" size={19} />答疑</button>
    </div>
    <div className={s.body} ref={body}>
      <div className={s.mode}><Asset name="checkpoint-target" />{lessonModes[mode].title} · 图像与性质</div>
      <h3>{title}</h3>
      {isChoice && <p className={s.subtitle}>选择一个正确答案</p>}
      {(mode === 1 || mode === 3 || mode === 5) && <div className={s.figure}><div><p>二次函数的一般式为</p><span>y = ax² + bx + c</span></div><Image src="/images/landing-r3/lesson/l04-figure-quadratic-card-visual.png" alt="二次函数开口向上的图像" width={140} height={116} /></div>}
      {!isChoice && !isMatch && <div className={s.card}>{chunks.slice(0,visible).map((p,i)=><p key={p}><span className={s.step}>{mode === 4 ? `${i + 1}. ` : ''}</span>{p}</p>)}</div>}
      {isChoice && <div className={s.options}>{options.map((text,i)=><button type="button" key={text} disabled={checked} aria-pressed={answer === i} data-state={checked ? i === 0 ? 'correct' : answer === i ? 'wrong' : '' : answer === i ? 'selected' : ''} onClick={()=>setAnswer(i)}><span>{String.fromCharCode(65+i)}</span>{text}{(checked && i === 0) || (!checked && answer === i) ? <Check size={20} /> : checked && answer === i ? <X size={20} /> : null}</button>)}</div>}
      {isMatch && <><p className={s.subtitle}>先选左边的函数，再选右边对应的性质。</p><div className={s.match}>{pairs.map((pair,i)=><button type="button" key={pair.left} disabled={checked} aria-label={`选择函数 ${pair.left}`} aria-pressed={left === i} onClick={()=>setLeft(i)}>{pair.left}{matches[i] !== undefined && <small>已配对 {matches[i] + 1}</small>}</button>)}{[2,0,1].map(i=><button type="button" key={i} disabled={checked || left === null} onClick={()=>{if(left !== null){setMatches({...matches,[left]:i});setLeft(null)}}}><small>{i+1}</small>{pairs[i].right}</button>)}</div></>}
      {(isChoice || isMatch) && !checked && <div className={s.hint}><Asset name="hint-lightbulb" size={26} /><span>提示：先看 a 的正负，再看常数项 c。</span></div>}
      {checked && <div className={s.feedback} role="status"><div><small>{correct ? '判断正确' : '你选的是'}</small><p>{correct ? '你已经抓住了关键。' : isMatch ? '这组配对还需要调整。' : options[answer ?? 0]}</p></div><div><small>其实是这样</small><p>{mode === 6 ? '令 x = 0，得到 y = c，所以交点为（0，c）。' : 'a > 0 时开口向上；a < 0 时开口向下。常数项 c 给出与 y 轴交点的纵坐标。'}</p></div><div><small>记住这一点</small><p>判断前，先找到公式中的 a 和 c。</p></div></div>}
      {ask && <aside className={s.hint}><Asset name="ask-chat-bubble" size={24} /><span>这一题可以先找出 a 的符号，再判断开口方向。<br />这是本节预设答疑示例。</span></aside>}
    </div>
    <div className={s.bottom}><button className={s.cta} type="button" disabled={isChoice ? answer === null : isMatch ? Object.keys(matches).length < pairs.length : false} onClick={advance}>{label}</button></div>
    <div className={s.context}><Asset name="context-book" size={25} /><span>数学 · 初三 · 二次函数 · 第 <b>{mode+1}/9</b> 小节</span></div>
  </div>
}
