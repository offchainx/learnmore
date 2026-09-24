'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight, Check, ChartNoAxesCombined, MessageCircle, PencilLine } from 'lucide-react'
import { handwriting } from './typography'
import styles from './LearningJourney.module.css'
import { LessonPhone, lessonModes } from './LessonPhone'
import { AccumulationCards } from './AccumulationCards'

const features = [
  { name: '练习', tab: 'Practice', image: 'practice', Icon: PencilLine, title: '换一道题，看看会不会用。', body: '看懂解析，还需要独立做一次。用练习检验理解，找到真正卡住的那一步。', carry: '留下的积累：答题与错题记录，为后续复习提供线索。', example: '换成 y = −2x²：这次开口方向是什么？' },
  { name: '答疑', tab: 'Ask', image: 'ask', Icon: MessageCircle, title: '把那个“为什么”，问明白。', body: '不懂时就问，不必等全部练完。从题目或概念里的具体疑问出发，把思路接起来。', carry: '留下的积累：把卡住的原因说清楚，再回到题目检验。', example: '为什么 −2 让开口向下？因为 x² 不小于 0，乘以负数后，y 不大于 0。' },
  { name: '分析', tab: 'Analyse', image: 'analyse', Icon: ChartNoAxesCombined, title: '不只记得做过，更看清哪里会了。', body: '把学习与练习放在一起看：哪些内容已有把握，哪些地方还要巩固，让下一次投入更有方向。', carry: '下一步的依据：学习过程和作答记录，而不只是做了多少题。', example: '回看同一知识点：能否独立判断开口方向？换成不同系数时是否仍会？' },
] as const

export function LearningJourney() {
  const [mode, setMode] = useState(1)
  const [active, setActive] = useState(0)
  const feature = features[active]
  return (
    <div className={styles.journey}>
      <section id="learning-loop" className={styles.learn} aria-labelledby="learn-title">
        <div className={styles.learnCopy}>
          <p className={`${handwriting.className} ${styles.kicker}`}>01 · 从一个知识点开始</p>
          <h2 id="learn-title">今天，先弄懂<br />一个知识点。</h2>
          <p className={styles.intro}>读一点，想一下，再动手试一题。<br />学习的下一步，从你刚刚理解的地方开始。</p>
          <div className={styles.modeButtons} role="group" aria-label="选择微课模式">
            {lessonModes.map((item, index) => <button type="button" key={item.title} aria-pressed={mode === index} onClick={() => setMode(index)}><strong>{item.title}</strong><span>{item.description}</span></button>)}
          </div>
          <p className={styles.disclaimer}>点选一种模式，或在手机里体验一小段微课。</p>
        </div>
        <LessonPhone key={mode} mode={mode} onModeChange={setMode} />
      </section>

      <section id="practice-ask-analyse" className={styles.loop} aria-labelledby="loop-title">
        <div className={styles.sectionHeading}>
          <p className={`${handwriting.className} ${styles.kicker}`}>02 · 把每一步，接起来</p>
          <h2 id="loop-title">练、问、看，<br />都围绕同一次进步。</h2>
        </div>
        <div className={styles.featureLayout}>
        <div className={styles.featureButtons} role="group" aria-label="选择功能展示">
          {features.map(({ name, tab, Icon }, index) => <button key={tab} type="button" aria-pressed={active === index} aria-controls="feature-detail" onClick={() => setActive(index)}><Icon size={20} aria-hidden="true" /><span>{name}</span></button>)}
        </div>
        <div id="feature-detail" className={styles.featureDetail}>
          <div className={styles.featureCopy} aria-live="polite" aria-atomic="true">
            <span className={styles.featureNumber}>0{active + 1} / 03</span>
            <h3>{feature.title}</h3>
            <p className={styles.intro}>{feature.body}</p>
            <div className={styles.example}><span>同一个知识点 · 场景示意</span><p>{feature.example}</p></div>
            <p className={styles.carry}><Check size={20} aria-hidden="true" />{feature.carry}</p>
            <a className={styles.cta} href="#beta">申请成为种子用户 <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
        </div>
          <figure className={styles.staticFeature}>
            <div className={styles.staticCrop} data-image={feature.image}><Image key={feature.image} src={`/images/landing-r3/${feature.image}-reference.png`} alt={`${feature.name}功能界面示例`} width={854} height={1844} sizes="(max-width: 767px) 85vw, 290px" /></div>
            <figcaption>示例数据</figcaption>
          </figure>
        </div>
      </section>

      <AccumulationCards />
    </div>
  )
}
