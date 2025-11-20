import styles from '../styles/home.module.css';

export default function RecentlyOpened() {
  const recentItems = [
    {
      id: 1,
      title: 'Lyra Project Tracker',
      icon: '',
      lastOpened: 'Opened 4 hours ago',
      color: '#7B61FF'
    },
   
  ];

  return (
    <div className={styles.recentlyOpened}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recently opened</h2>
        <button className={styles.viewAllButton}>View all</button>
      </div>
      
      <div className={styles.recentItems}>
        {recentItems.map((item) => (
          <div key={item.id} className={styles.recentItem}>
            <div 
              className={styles.itemIcon}
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>
            <div className={styles.itemContent}>
              <div className={styles.itemTitle}>{item.title}</div>
              <div className={styles.itemSubtitle}>{item.lastOpened}</div>
            </div>
          </div>
        ))}
        
        {}
        {recentItems.length === 0 && (
          <div className={styles.emptyRecent}>
            <div className={styles.emptyRecentIcon}>📁</div>
            <div className={styles.emptyRecentText}>
              You haven't opened anything recently
            </div>
          </div>
        )}
      </div>
    </div>
  );
}