import styles from '../styles/header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <button className={styles.hamburgerButton}>
          <span className={styles.hamburgerIcon}>☰</span>
        </button>
        <div className={styles.logo}>
          <span className={styles.logoText}>Airtable</span>
        </div>
        <h1 className={styles.pageTitle}>Home</h1>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
            className={styles.searchInput}
          />
          <div className={styles.searchShortcut}>Ctrl + K</div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className={styles.rightSection}>
        <button className={styles.tryDemoButton}>
          Try demo
        </button>
        <button className={styles.iconButton}>
          <span className={styles.helpIcon}>?</span>
        </button>
        <button className={styles.iconButton}>
          <span className={styles.notificationIcon}>🔔</span>
        </button>
        <div className={styles.userAvatar}>
          <span>A</span>
        </div>
      </div>
    </header>
  );
}