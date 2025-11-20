import styles from '../styles/sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        {}
        <div className={styles.logoSection}>
          <div className={styles.logo}></div>
          <span className={styles.logoText}>MY-AIRTABLE-CLONE</span>
        </div>

        {}
        <nav className={styles.navigation}>
          <div className={`${styles.navItem} ${styles.active}`}>
            <span className={styles.navIcon}></span>
            <span>Home</span>
          </div>
          
          <div className={styles.navItem}>
            <span className={styles.navIcon}></span>
            <span>Starred</span>
          </div>
          
          <div className={styles.navItem}>
            <span className={styles.navIcon}></span>
            <span>Shared</span>
          </div>

          {}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Workspaces</span>
              <button className={styles.addButton}>+</button>
            </div>
          </div>
        </nav>

        {}
        <div className={styles.bottomLinks}>
          <div className={styles.bottomLink}>Templates and apps</div>
          <div className={styles.bottomLink}>Marketplace</div>
          <div className={styles.bottomLink}>Import</div>
        </div>

        {}
        <button className={styles.createButton}>
          + Create
        </button>
      </div>
    </aside>
  );
}