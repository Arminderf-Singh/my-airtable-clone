import { redirect } from "next/navigation";
import { getSession } from "~/lib/auth";
import Link from "next/link";
import styles from "./bases.module.css";


const todayItems = [
  {
    id: "1",
    name: "Untitled Base",
    type: "base",
    lastOpened: "just now",
    icon: "",
    color: "#0052cc"
  }
];

const pastWeekItems = [
  {
    id: "2", 
    name: "Lyra Project Tracker",
    type: "base",
    lastOpened: "yesterday",
    icon: "",
    color: "#27ae60"
  },
  {
    id: "3",
    name: "Marketing Campaigns",
    type: "base", 
    lastOpened: "2 days ago",
    icon: "",
    color: "#9b51e0"
  },
  {
    id: "4",
    name: "Content Calendar",
    type: "base",
    lastOpened: "3 days ago", 
    icon: "",
    color: "#ff6b6b"
  }
];

const quickActions = [
  {
    title: "Import data",
    description: "Bring your data into Airtable",
    icon: "",
    color: "blue",
    href: "/import"
  },
  {
    title: "Create a base",
    description: "Start from scratch",
    icon: "", 
    color: "purple",
    href: "/bases/create"
  },
  {
    title: "Use a template",
    description: "Start from a template",
    icon: "",
    color: "green",
    href: "/templates"
  },
  {
    title: "Learn Airtable",
    description: "Get started with guides",
    icon: "",
    color: "pink",
    href: "/learn"
  }
];

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className={styles.homePage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Home</h1>
      </div>

      {/* Upgrade Banner */}
      <div className={styles.upgradeBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <div className={styles.bannerMainText}>
              Your trial ends in <strong>13 days</strong>
            </div>
            <div className={styles.bannerSubtext}>
              Upgrade to keep your bases and access premium features
            </div>
          </div>
          <div className={styles.bannerActions}>
            <button className={styles.upgradeButton}>
              Upgrade
            </button>
            <a href="#" className={styles.compareLink}>
              Compare plans
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.actionSection}>
        <h2 className={styles.sectionTitle}>Quick actions</h2>
        <div className={styles.actionCards}>
          {quickActions.map((action, index) => (
            <Link 
              key={index}
              href={action.href}
              className={`${styles.actionCard} ${styles[action.color]}`}
            >
              <div className={styles.cardIcon}>
                {action.icon}
              </div>
              <h3 className={styles.cardTitle}>{action.title}</h3>
              <p className={styles.cardDescription}>{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recently Opened - Main Section */}
      <div className={styles.recentlyOpenedSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recently opened</h2>
          <button className={styles.viewAllButton}>
            View all
          </button>
        </div>
        
        {/* Today Subsection */}
        <div className={styles.timeSection}>
          <h3 className={styles.timeSectionTitle}>Today</h3>
          <div className={styles.baseCardsGrid}>
            {todayItems.length > 0 ? (
              todayItems.map((item) => (
                <BaseCard key={item.id} item={item} />
              ))
            ) : (
              <div className={styles.emptySection}>
                No bases opened today
              </div>
            )}
          </div>
        </div>

        {/* Past 7 Days Subsection */}
        <div className={styles.timeSection}>
          <h3 className={styles.timeSectionTitle}>Past 7 days</h3>
          <div className={styles.baseCardsGrid}>
            {pastWeekItems.length > 0 ? (
              pastWeekItems.map((item) => (
                <BaseCard key={item.id} item={item} />
              ))
            ) : (
              <div className={styles.emptySection}>
                No bases opened in the past 7 days
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Base Card Component (similar to your bases page)
function BaseCard({ item }: { item: any }) {
  return (
    <Link
      href={`/base/${item.id}`}
      className={styles.baseCard}
    >
      <div 
        className={styles.baseIcon}
        style={{ backgroundColor: item.color }}
      >
        {item.icon}
      </div>
      <div className={styles.baseContent}>
        <h3 className={styles.baseName}>{item.name}</h3>
        <p className={styles.baseMeta}>
          Opened {item.lastOpened}
        </p>
      </div>
    </Link>
  );
}