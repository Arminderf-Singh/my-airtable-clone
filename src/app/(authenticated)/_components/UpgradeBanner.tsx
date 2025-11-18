import styles from '../styles/home.module.css';

export default function UpgradeBanner() {
  return (
    <div className={styles.upgradeBanner}>
      <div className={styles.bannerContent}>
        <div className={styles.bannerText}>
          <div className={styles.bannerMainText}>
            Upgrade to the Team plan before your trial expires in 14 days
          </div>
          <div className={styles.bannerSubtext}>
            Keep the power you need to manage complex workflows, design interfaces, and more.
          </div>
        </div>
        <div className={styles.bannerActions}>
          <button className={styles.upgradeButton}>Upgrade</button>
          <a href="#" className={styles.compareLink}>Compare plans</a>
        </div>
      </div>
    </div>
  );
}