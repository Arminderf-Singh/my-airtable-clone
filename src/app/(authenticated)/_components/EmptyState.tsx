import styles from '../styles/components.module.css';

export default function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        <h3 className={styles.emptyStateTitle}>
          You haven't opened anything recently
        </h3>
        <button className={styles.workspacesButton}>
          Go to all workspaces
        </button>
      </div>
    </div>
  );
}