import { DataTable } from "~/components/DataTable";
import "~/styles/datatable.css";

export default function TablePage() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <DataTable />
    </div>
  );
}