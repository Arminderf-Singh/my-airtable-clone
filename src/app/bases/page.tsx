import { redirect } from "next/navigation";
import { getSession } from "~/lib/auth";
import { api } from "~/trpc/server";
import Link from "next/link";
import { CreateBaseForm } from "~/components/CreateBaseForm";

// Define BaseCard FIRST
function BaseCard({ base }: { base: any }) {
  return (
    <Link
      href={`/base/${base.id}`}
      style={{
        display: "block",
        borderRadius: "0.5rem",
        border: "1px solid #e5e7eb",
        padding: "1.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.2s",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>{base.name}</h2>
      <p style={{ color: "#6b7280" }}>
        {base.tables?.length ?? 0} table{base.tables?.length !== 1 ? "s" : ""}
      </p>
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
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Your Bases</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <CreateBaseForm />
          <Link 
            href="/table"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "white",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            View Table Demo
          </Link>
          <Link 
            href="/api/auth/signout"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ef4444",
              color: "white",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Log out
          </Link>
        </div>
      </div>
      
      {bases.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#6b7280" }}>No bases yet. Create your first base!</h2>
          <div style={{ marginTop: "2rem" }}>
            <Link 
              href="/table"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontSize: "1rem",
              }}
            >
              Try Table Demo
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {bases.map((base) => (
            <BaseCard key={base.id} base={base} />
          ))}
        </div>
      )}
    </div>
  );
}