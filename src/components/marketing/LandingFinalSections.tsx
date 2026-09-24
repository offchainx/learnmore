import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle, UserRoundCheck } from 'lucide-react'
import { BetaSignupForm } from './BetaSignupForm'
import { marketingSiteConfig } from '@/lib/marketing/site-shell'
import styles from './LandingFinalSections.module.css'

const questions = [
  {
    question: '这次内测适合谁？',
    answer: '首批面向马来西亚华文独中初一至初三学生，先从数学、科学、历史和地理开始。家长也可以代孩子登记。具体内容会随内测逐步开放。',
  },
  {
    question: '报名就一定能获得资格吗？',
    answer: '不会。首批招募 30 位愿意认真体验并反馈的种子用户；我们会进一步了解学习情况，再确认邀请名单。目前的表单先收集邮箱与体验意向。',
  },
  {
    question: '内测免费多久？',
    answer: '入选并完成注册后，全量功能免费体验两周，从完成注册当天开始计算。结束后会选出 10 位学习表现优异的用户，延续两个月 Pro 资格；具体评选方式会在正式邀请时说明。',
  },
  {
    question: 'iPhone 和 Android 都能参加吗？',
    answer: '我们正在准备 iOS 与 Android 的内测安排。确认入选后，会按当时可用的设备与版本提供安装说明；登记时可以先告诉我们使用哪种设备。',
  },
  {
    question: '微课是视频吗？',
    answer: '微课以阅读和交互为主。你可以一段段读、动手尝试，再用检查点看看自己是否真的理解。',
  },
  {
    question: '内测结束后，学习记录怎么办？',
    answer: '学习记录会保留。正式版不同方案对部分学习、练习和分析记录的访问范围仍在确定，规则明确后会如实说明。',
  },
  {
    question: '遇到问题，可以找谁？',
    answer: '可以发邮件到 help@learnbank.ai。收到内测反馈后，我们承诺在 48 小时内给出解决方案；需要版本更新时，还需经过商店审核。',
  },
]

export function LandingFinalSections() {
  return (
    <>
      <section id="faq" className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqInner}>
          <div className={styles.faqIntro}>
            <p className={styles.kicker}>07 · 内测安排与常见问题</p>
            <h2 id="faq-title">想清楚了，<br />再决定加入。</h2>
            <p>两周怎么开始、能学什么、报名后会怎样，这里先说清楚。</p>
            <div className={styles.betaFacts} aria-label="内测关键安排">
              <div><strong>30 位</strong><span>首批种子用户</span></div>
              <div><strong>2 周</strong><span>注册起免费体验</span></div>
              <div><strong>10 位</strong><span>延续两个月 Pro 资格</span></div>
            </div>
            <Link href="/pricing" className={styles.textLink}>看看正式版方案 <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className={styles.questionList}>
            {questions.map(({ question, answer }) => (
              <details key={question} className={styles.question}>
                <summary>{question}<span className={styles.plus} aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="beta" className={styles.apply} aria-labelledby="beta-title">
        <div className={styles.applyIntro}>
          <p className={styles.kicker}>08 · 免费申请内测</p>
          <h2 id="beta-title">从这一步，<br />一起把第一版做好。</h2>
          <p className={styles.applyLead}>面向独中初一至初三学生，家长也可代登记。首批招募 30 位种子用户，入选后从完成注册起免费体验两周。</p>
          <div className={styles.applySteps}>
            <div><span><Mail size={19} aria-hidden="true" /></span><p><strong>先留下意向</strong><br />填写邮箱、设备与想体验的内容。</p></div>
            <div><span><MessageCircle size={19} aria-hidden="true" /></span><p><strong>再了解学习情况</strong><br />正式筛选时沟通学习需要与反馈安排。</p></div>
            <div><span><UserRoundCheck size={19} aria-hidden="true" /></span><p><strong>确认后开始体验</strong><br />报名不等于入选；邀请与安装方式另行通知。</p></div>
          </div>
          <p className={styles.contact}>有问题？<a href={`mailto:${marketingSiteConfig.supportEmail}`}>{marketingSiteConfig.supportEmail}</a></p>
        </div>
        <div className={styles.formPanel}>
          <p className={styles.formKicker}>首批 30 位 · 免费两周</p>
          <h3>登记内测意向</h3>
          <p>目前先收集基本意向。提交后不会自动获得种子用户资格，也不会在这里收取付款。</p>
          <BetaSignupForm locale="zh" />
        </div>
      </section>
    </>
  )
}
