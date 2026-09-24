import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import styles from './SelectedStorySections.module.css'

const subjects = [
  { name: '数学', description: '把思路一步步理清' },
  { name: '科学', description: '从现象读懂原理' },
  { name: '历史', description: '把事件的来龙去脉串起来' },
  { name: '地理', description: '读懂地图，也认识世界' },
]

export function SubjectsStorySection() {
  return (
      <section id="subjects-overview" className={styles.section} aria-label="初一至初三、四科范围">
        <div className={styles.desktopArt}>
          <h1 className={styles.srOnly}>从初一到初三，先把四科基础学扎实。</h1>
          <Image
            src="/images/landing-r4/subjects-cards.png"
            alt="数学、科学、历史和地理四张学习卡；首批面向马来西亚华文独中初一至初三学生。"
            width={1586}
            height={992}
            sizes="100vw"
            className={styles.fullArt}
          />
          <Link className={`${styles.artLink} ${styles.subjectArtLink}`} href="/#beta" aria-label="免费申请内测" />
        </div>

        <div className={styles.mobileArt}>
          <p className={styles.kicker}>首批学习范围</p>
          <h1 className={styles.title}>从初一到初三，<br />先把四科基础学扎实。</h1>
          <p className={styles.lead}>首批内测面向马来西亚华文独中初一至初三学生。</p>
          <div className={styles.years} aria-label="覆盖年级"><span>初一</span><span>初二</span><span>初三</span></div>
          <div className={styles.subjectGrid}>
            {subjects.map((subject, index) => (
              <article key={subject.name} className={styles.subjectCard}>
                <div className={`${styles.subjectPhoto} ${styles[`subjectPhoto${index}`]}`} role="img" aria-label={`${subject.name}学习场景`} />
                <h3>{subject.name}</h3>
                <p>{subject.description}</p>
              </article>
            ))}
          </div>
          <Link className={styles.mobileCta} href="/#beta">免费申请内测 <ArrowRight size={20} aria-hidden="true" /></Link>
          <p className={styles.note}>首批招募范围，内容随内测逐步开放。</p>
        </div>
      </section>
  )
}

export function ParentsStorySection() {
  return (
      <section id="for-parents" className={`${styles.section} ${styles.parentSection}`} aria-label="家长真实困扰">
        <div className={styles.desktopArt}>
          <h2 className={styles.srOnly}>陪在旁边，却不知道该怎么帮。</h2>
          <Image
            src="/images/landing-r4/parents-beside.png"
            alt="家长坐在孩子身旁，看他写作业；文案讲述家长不知道孩子究竟卡在哪一步的困扰。"
            width={1586}
            height={992}
            sizes="100vw"
            className={styles.fullArt}
          />
          <a className={`${styles.artLink} ${styles.parentArtLink}`} href="#beta" aria-label="为孩子申请内测" />
        </div>

        <div className={`${styles.mobileArt} ${styles.parentMobile}`}>
          <p className={styles.kicker}>给关心孩子学习的你</p>
          <h2 className={styles.title}>陪在旁边，<br />却不知道该怎么帮。</h2>
          <p className={styles.lead}>不是不关心，是不知道孩子究竟卡在哪一步。</p>
          <ul className={styles.parentQuestions}>
            <li>问学会了吗，只得到一句差不多。</li>
            <li>想帮一把，却不知道从哪一题开始。</li>
          </ul>
          <p className={styles.parentPromise}>让学过的、练过的，留下看得懂的线索。</p>
          <a className={styles.mobileCta} href="#beta">为孩子申请内测 <ArrowRight size={20} aria-hidden="true" /></a>
          <div className={styles.parentPhoto} role="img" aria-label="家长陪孩子在书桌前学习的情境照片" />
        </div>
      </section>
  )
}
