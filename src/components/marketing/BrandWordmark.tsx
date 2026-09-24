import styles from './LandingHero.module.css'

export function BrandWordmark() {
  return <span className={styles.wordmark} aria-label="Learnbank.ai">Learnbank<span className={styles.aiBadge} aria-hidden="true">.ai</span></span>
}
