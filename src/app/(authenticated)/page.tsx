import UpgradeBanner from './_components/UpgradeBanner';
import ActionCards from './_components/ActionCards';
import RecentlyOpened from './_components/RecentlyOpened';
import styles from './styles/home.module.css';

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Home</h1>
      </div>
      
      <UpgradeBanner />
      <ActionCards />
      <RecentlyOpened />
    </div>
  );
}