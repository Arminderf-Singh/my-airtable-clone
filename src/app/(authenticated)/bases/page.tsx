import { redirect } from "next/navigation";
import { getSession } from "~/lib/auth";
import { api } from "~/trpc/server";
import Link from "next/link";
import { CreateBaseForm } from "~/components/CreateBaseForm";
import styles from "./bases.module.css";

// Define BaseCard FIRST
function BaseCard({ base }: { base: any }) {
  return (
    <Link
      href={`/base/${base.id}`}
      className={styles.baseCard}
    >
      <div className={styles.baseIcon}>📊</div>
      <div className={styles.baseContent}>
        <h3 className={styles.baseName}>{base.name}</h3>
        <p className={styles.baseMeta}>
          {base.tables?.length ?? 0} table{base.tables?.length !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}

export default async function BasesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  let bases = [];
  try {
    const caller = await api();
    bases = await caller.base.list();
  } catch (error) {
    console.error("Error fetching bases:", error);
    bases = [];
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Your Bases</h1>
          <p className={styles.subtitle}>Create and manage your bases</p>
        </div>
        <div className={styles.headerActions}>
          <Link 
            href="/table"
            className={styles.demoButton}
          >
            View Table Demo
          </Link>
          <CreateBaseForm />
        </div>
      </div>
      
      {bases.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📁</div>
          <h2 className={styles.emptyTitle}>No bases yet</h2>
          <p className={styles.emptyDescription}>
            Create your first base to start organizing your data
          </p>
          <div className={styles.emptyActions}>
            <Link 
              href="/table"
              className={styles.tryDemoButton}
            >
              Try Table Demo
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.basesGrid}>
          {bases.map((base) => (
            <BaseCard key={base.id} base={base} />
          ))}
        </div>
      )}
    </div>
  );
}