"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function CreateBaseForm() {
  const [name, setName] = useState("");
  const router = useRouter();
  
  const createBase = api.base.create.useMutation({
    onSuccess: () => {
      router.refresh(); // Refresh the page to show the new base
      setName(""); // Clear the input
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createBase.mutate({ name: name.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Base name"
        style={{
          borderRadius: "0.5rem",
          border: "1px solid #d1d5db",
          padding: "0.5rem 0.75rem",
          minWidth: "200px",
        }}
        required
      />
      <button
        type="submit"
        disabled={createBase.isPending}
        style={{
          borderRadius: "0.5rem",
          backgroundColor: createBase.isPending ? "#9ca3af" : "#3b82f6",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          cursor: createBase.isPending ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) => {
          if (!createBase.isPending) {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }
        }}
        onMouseOut={(e) => {
          if (!createBase.isPending) {
            e.currentTarget.style.backgroundColor = "#3b82f6";
          }
        }}
      >
        {createBase.isPending ? "Creating..." : "Create Base"}
      </button>
    </form>
  );
}