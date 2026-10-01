import type { ReactNode } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import styles from './IPhoneFrame.module.css'

export function IPhoneFrame({ children, className = '', screenClassName = '', label = 'iPhone 界面展示' }: {
  children: ReactNode
  className?: string
  screenClassName?: string
  label?: string
}) {
  return <div className={`${styles.frame} ${className}`} role="group" aria-label={label} data-iphone-frame>
    <div className={styles.screen}>
      <div className={styles.status} aria-hidden="true"><span>9:41</span><span className={styles.island} /><span className={styles.indicators}><Signal size={14} /><Wifi size={14} /><BatteryFull size={19} /></span></div>
      <div className={`${styles.content} ${screenClassName}`}>{children}</div>
      <div className={styles.home} aria-hidden="true"><span /></div>
    </div>
  </div>
}
