"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";

// Define types
type CellValue = string | number;

interface Cell {
  id: string;
  value: CellValue;
  columnId: string;
  rowId: string;
}

interface Column {
  id: string;
  name: string;
  type: "text" | "number";
}

interface Row {
  id: string;
  cells: Cell[];
}

interface TableData {
  id: string;
  name: string;
  columns: Column[];
  rows: Row[];
}

interface DataTableProps {
  initialData?: TableData;
}

// Static data for 100 rows
const createStaticData = (): TableData => {
  const columns: Column[] = [
    { id: "name", name: "Name", type: "text" },
    { id: "email", name: "Email", type: "text" },
    { id: "age", name: "Age", type: "number" },
    { id: "role", name: "Role", type: "text" },
    { id: "department", name: "Department", type: "text" },
  ];

  const rows: Row[] = Array.from({ length: 100 }, (_, index) => ({
    id: `row-${index}`,
    cells: [
      { id: `name-${index}`, value: `User ${index + 1}`, columnId: "name", rowId: `row-${index}` },
      { id: `email-${index}`, value: `user${index + 1}@company.com`, columnId: "email", rowId: `row-${index}` },
      { id: `age-${index}`, value: Math.floor(Math.random() * 50) + 20, columnId: "age", rowId: `row-${index}` },
      { id: `role-${index}`, value: ["Developer", "Designer", "Manager", "Analyst"][index % 4], columnId: "role", rowId: `row-${index}` },
      { id: `department-${index}`, value: ["Engineering", "Design", "Product", "Marketing"][index % 4], columnId: "department", rowId: `row-${index}` },
    ],
  }));

  return {
    id: "static-table",
    name: "Sample Table",
    columns,
    rows,
  };
};

export function DataTable({ initialData }: DataTableProps) {
  const [data, setData] = useState<TableData>(initialData || createStaticData());
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newColumnName, setNewColumnName] = useState("");

  // Transform our data for TanStack Table - ensure proper row structure
  const tableData = useMemo(() => {
    return data.rows.map(row => {
      const rowData: any = { 
        id: row.id,
        _original: row // Store original row data for reference
      };
      
      // Map cells to column accessors
      row.cells.forEach(cell => {
        rowData[cell.columnId] = cell.value;
      });
      
      return rowData;
    });
  }, [data]);

  // Create columns for TanStack Table
  const columns = useMemo<ColumnDef<any>[]>(() => {
    return data.columns.map(column => ({
      id: column.id,
      accessorKey: column.id,
      header: () => (
        <div className="column-header">
          {column.name}
          <span className="column-type">({column.type})</span>
        </div>
      ),
      cell: (info: any) => {
        const rowId = info.row.original.id;
        const columnId = column.id;
        
        const cell = data.rows
          .find(r => r.id === rowId)
          ?.cells.find(c => c.columnId === columnId);

        const value = cell?.value || "";

        const isEditing = editingCell?.rowId === rowId && editingCell.columnId === columnId;

        if (isEditing) {
          return (
            <input
              type={column.type === "number" ? "number" : "text"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                // Update the data
                setData(prev => ({
                  ...prev,
                  rows: prev.rows.map(r => 
                    r.id === rowId 
                      ? {
                          ...r,
                          cells: r.cells.map(c =>
                            c.columnId === columnId 
                              ? { ...c, value: column.type === "number" ? Number(e.target.value) : e.target.value }
                              : c
                          ),
                        }
                      : r
                  ),
                }));
                setEditingCell(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingCell(null);
                } else if (e.key === "Escape") {
                  setEditingCell(null);
                }
              }}
              autoFocus
              className="cell-input"
            />
          );
        }

        return (
          <div
            className="cell-content"
            onClick={() => {
              setEditingCell({ rowId, columnId });
              setEditValue(String(value));
            }}
          >
            {value}
          </div>
        );
      },
      size: 200,
    }));
  }, [data, editingCell, editValue]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // Explicitly tell TanStack how to get row IDs
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => document.getElementById("table-container"),
    estimateSize: () => 40,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const addNewColumn = () => {
    if (!newColumnName.trim()) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: newColumnName,
      type: "text",
    };

    setData(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      rows: prev.rows.map(row => ({
        ...row,
        cells: [
          ...row.cells,
          {
            id: `${newColumn.id}-${row.id}`,
            value: "",
            columnId: newColumn.id,
            rowId: row.id,
          },
        ],
      })),
    }));

    setNewColumnName("");
  };

  const addNewRow = () => {
    const newRowId = `row-${Date.now()}`;
    const newRow: Row = {
      id: newRowId,
      cells: data.columns.map(column => ({
        id: `${column.id}-${Date.now()}`,
        value: "",
        columnId: column.id,
        rowId: newRowId,
      })),
    };

    setData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  return (
    <div className="data-table-container">
      {/* Table Header */}
      <div className="table-header">
        <h2 className="table-title">{data.name}</h2>
        <div className="table-actions">
          <div className="add-column-form">
            <input
              type="text"
              placeholder="New column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="column-input"
              onKeyDown={(e) => e.key === "Enter" && addNewColumn()}
            />
            <button onClick={addNewColumn} className="add-column-btn">
              Add Column
            </button>
          </div>
          <button onClick={addNewRow} className="add-row-btn">
            Add Row
          </button>
        </div>
      </div>

      {/* Table */}
      <div id="table-container" className="table-container">
        <table className="data-table">
          <thead className="table-head">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-header-cell"
                    style={{
                      width: header.getSize(),
                      position: "relative",
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${
                        header.column.getIsResizing() ? "isResizing" : ""
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="table-body">
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;

              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="table-row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="table-cell"
                      style={{
                        width: cell.column.getSize(),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Info */}
      <div className="table-info">
        <span>{data.rows.length} rows</span>
        <span>{data.columns.length} columns</span>
      </div>
    </div>
  );
}