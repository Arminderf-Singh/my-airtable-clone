import styles from '../styles/home.module.css';

export default function ActionCards() {
  const cards = [
    { 
      title: 'Start with Omnì', 
      icon: '🤖',
      color: 'pink' 
    },
    { 
      title: 'Start with templates', 
      icon: '📋',
      color: 'purple' 
    },
    { 
      title: 'Quickly upload', 
      icon: '📤',
      color: 'green' 
    },
    { 
      title: 'Build an app on your own', 
      icon: '🛠️',
      color: 'blue' 
    },
  ];

  return (
    <div className={styles.actionSection}>
      <h2 className={styles.sectionTitle}>Create new</h2>
      <div className={styles.actionCards}>
        {cards.map((card, index) => (
          <div key={index} className={`${styles.actionCard} ${styles[card.color]}`}>
            <div className={styles.cardIcon}>{card.icon}</div>
            <div className={styles.cardTitle}>{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}