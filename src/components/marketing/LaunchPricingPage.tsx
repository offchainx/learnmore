'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { LandingHeader } from './LandingHero'
import { MarketingFullFooter } from './MarketingFullFooter'
import { editorial } from './typography'
import styles from './LaunchPricingPage.module.css'

const comparison = [
  { feature: '微课学习', free: '基础用量；计划可通过看广告继续学习', pro: '更高用量，具体额度待公布' },
  { feature: '题目练习', free: '基础用量；计划可通过看广告继续练习', pro: '更高用量，具体额度待公布' },
  { feature: 'AI 助教答疑', free: '基础用量，具体额度待公布', pro: '更高用量，具体额度待公布' },
  { feature: '学习分析', free: '可体验范围待确认', pro: '订阅后获得完整体验' },
] as const

export function LaunchPricingPage() {
  return (
    <div className={`${editorial.variable} landing-r2-shell marketing-shell min-h-screen bg-[#fffaf0] font-sans`}>
      <LandingHeader home={false} />
      <main id="main-content" className={styles.main}>
        <section className={styles.intro} aria-labelledby="pricing-heading">
          <p className={styles.kicker}>正式版规划 · 价格待公布</p>
          <h1 id="pricing-heading">先好好学，<br />再选适合自己的方案。</h1>
          <p>正式版计划提供免费版与 Pro 版。区别主要在学习分析的体验，以及微课、练习和答疑的用量；具体额度与价格仍在确认中。</p>
        </section>

        <section className={styles.tiers} aria-label="免费版和 Pro 版">
          <article className={styles.tier}>
            <p className={styles.tierIndex}>01 · 日常学习</p>
            <h2>免费版</h2>
            <p className={styles.tierPrice}>免费</p>
            <p className={styles.tierLead}>从一个知识点开始，先试着学、练、问。</p>
            <ul><li><Check size={19} aria-hidden="true" />微课、练习与答疑提供基础用量</li><li><Check size={19} aria-hidden="true" />计划通过观看广告继续微课和练习</li><li><Check size={19} aria-hidden="true" />学习分析的免费范围待确认</li></ul>
          </article>
          <article className={`${styles.tier} ${styles.proTier}`}>
            <p className={styles.tierIndex}>02 · 更完整的学习路径</p>
            <h2>Pro 版</h2>
            <p className={styles.tierPrice}>价格待公布</p>
            <p className={styles.tierLead}>让学过的、练过的，有更完整的分析可以接着看。</p>
            <ul><li><Check size={19} aria-hidden="true" />微课、练习与答疑提供更高用量</li><li><Check size={19} aria-hidden="true" />订阅后获得完整学习分析体验</li><li><Check size={19} aria-hidden="true" />具体权益与额度上线前说明</li></ul>
          </article>
        </section>

        <section className={styles.comparison} aria-labelledby="compare-heading">
          <div className={styles.compareHeader}><p className={styles.kicker}>看看差别</p><h2 id="compare-heading">你会在哪里用到它们？</h2></div>
          <div className={styles.comparisonTable}>
            {comparison.map(row => (
              <div className={styles.compareRow} key={row.feature}>
                <h3>{row.feature}</h3>
                <div><span>免费版</span><p>{row.free}</p></div>
                <div><span>Pro 版</span><p>{row.pro}</p></div>
              </div>
            ))}
          </div>
          <p className={styles.pendingNote}>以上是正式版的规划方向。具体用量、广告规则、免费分析范围，以及 Pro 到期后的访问范围，都会在正式上线前说明。</p>
        </section>

        <section className={styles.beta} aria-labelledby="pricing-beta-heading">
          <div><p className={styles.kicker}>现在正在招募种子用户</p><h2 id="pricing-beta-heading">先免费体验两周，<br />再一起把产品做好。</h2><p>首批 30 位入选用户，从完成注册起全量功能免费体验两周。报名需要筛选，不会自动获得资格。</p></div>
          <Link href="/#beta" className={styles.cta}>免费申请内测 <ArrowRight size={20} aria-hidden="true" /></Link>
        </section>
      </main>
      <MarketingFullFooter locale="zh" />
    </div>
  )
}
