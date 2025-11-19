"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { faker } from "@faker-js/faker";

// Types
type ColumnType = "text" | "number";
type TextFilterOperator = "contains" | "notContains" | "equals" | "isEmpty" | "isNotEmpty";
type NumberFilterOperator = "gt" | "lt" | "equals" | "gte" | "lte" | "isEmpty" | "isNotEmpty";

interface Column {
  id: string;
  name: string;
  type: ColumnType;
}

interface TableRow {
  id: string;
  [key: string]: any;
}

interface TableData {
  id: string;
  name: string;
  columns: Column[];
  rows: TableRow[];
}

interface DataTableProps {
  initialData?: TableData;
  onTableUpdate?: (table: TableData) => void;
}

// Filter types
interface BaseFilter {
  id: string;
  columnId: string;
  columnType: ColumnType;
}

interface TextFilter extends BaseFilter {
  columnType: "text";
  operator: TextFilterOperator;
  value: string;
}

interface NumberFilter extends BaseFilter {
  columnType: "number";
  operator: NumberFilterOperator;
  value: number;
}

type Filter = TextFilter | NumberFilter;

// Create default table with sample data
const createDefaultTable = (tableName: string = "New Table"): TableData => {
  const defaultColumns: Column[] = [
    { id: "name", name: "Name", type: "text" },
    { id: "email", name: "Email", type: "text" },
    { id: "age", name: "Age", type: "number" },
    { id: "role", name: "Role", type: "text" },
  ];

  const defaultRows: TableRow[] = Array.from({ length: 50 }, (_, index) => ({
    id: `row-${index}`,
    name: index % 2 === 0 ? "azir" : "yasuo",
    email: faker.internet.email(),
    age: faker.number.int({ min: 20, max: 65 }),
    role: faker.person.jobTitle(),
  }));

  return {
    id: `table-${Date.now()}`,
    name: tableName,
    columns: defaultColumns,
    rows: defaultRows,
  };
};

// Create 100k rows for performance testing
const createBulkRows = (columns: Column[], count: number = 100000): TableRow[] => {
  return Array.from({ length: count }, (_, index) => {
    const row: TableRow = { id: `bulk-row-${index}` };
    
    columns.forEach(column => {
      switch (column.type) {
        case "text":
          row[column.id] = faker.person.fullName();
          break;
        case "number":
          row[column.id] = faker.number.int({ min: 1, max: 10000 });
          break;
        default:
          row[column.id] = faker.lorem.words(3);
      }
    });
    
    return row;
  });
};

export function DataTable({ initialData, onTableUpdate }: DataTableProps) {
  const [data, setData] = useState<TableData>(initialData || createDefaultTable());
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<ColumnType>("text");
  const [isAddingBulkRows, setIsAddingBulkRows] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const createNewTable = useCallback((tableName: string) => {
    const newTable = createDefaultTable(tableName);
    setData(newTable);
    setFilters([]);
    onTableUpdate?.(newTable);
  }, [onTableUpdate]);


  const tableData = useMemo(() => {
    return data.rows.map(row => ({
      ...row,
      _original: row
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim() && filters.length === 0) return tableData;
    
    let result = tableData;

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(lowerSearch)
        );
      });
    }

    if (filters.length > 0) {
      result = result.filter(row => {
        return filters.every(filter => {
          const value = row[filter.columnId];
          
          if (filter.columnType === "text") {
            const textFilter = filter as TextFilter;
            const stringValue = String(value || "").toLowerCase();
            const filterValue = textFilter.value.toLowerCase();

            switch (textFilter.operator) {
              case "contains":
                return stringValue.includes(filterValue);
              case "notContains":
                return !stringValue.includes(filterValue);
              case "equals":
                return stringValue === filterValue;
              case "isEmpty":
                return !value || String(value).trim() === "";
              case "isNotEmpty":
                return value && String(value).trim() !== "";
              default:
                return true;
            }
          } else if (filter.columnType === "number") {
            const numberFilter = filter as NumberFilter;
            const numValue = Number(value);
            
            if (isNaN(numValue)) {
            
              if (numberFilter.operator === "isEmpty") {
                return value === null || value === undefined || value === "";
              }
              if (numberFilter.operator === "isNotEmpty") {
                return value !== null && value !== undefined && value !== "";
              }
              return false;
            }

            switch (numberFilter.operator) {
              case "gt":
                return numValue > numberFilter.value;
              case "lt":
                return numValue < numberFilter.value;
              case "equals":
                return numValue === numberFilter.value;
              case "gte":
                return numValue >= numberFilter.value;
              case "lte":
                return numValue <= numberFilter.value;
              case "isEmpty":
                return value === null || value === undefined || value === "";
              case "isNotEmpty":
                return value !== null && value !== undefined && value !== "";
              default:
                return true;
            }
          }
          
          return true;
        });
      });
    }

    return result;
  }, [tableData, searchTerm, filters]);


  const addFilter = useCallback((columnId: string, columnType: ColumnType, operator: TextFilterOperator | NumberFilterOperator, value: string | number) => {
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      columnId,
      columnType,
      operator: operator as any,
      value: columnType === "number" ? Number(value) : String(value),
    };
    
    setFilters(prev => [...prev, newFilter]);
    setActiveFilterColumn(null);
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  }, []);


  const clearAllFilters = useCallback(() => {
    setFilters([]);
  }, []);


  const getColumnFilters = useCallback((columnId: string) => {
    return filters.filter(filter => filter.columnId === columnId);
  }, [filters]);

  const TextFilterComponent = ({ columnId, columnName }: { columnId: string; columnName: string }) => {
    const [operator, setOperator] = useState<TextFilterOperator>("contains");
    const [value, setValue] = useState("");

    const handleApply = () => {
      if (operator !== "isEmpty" && operator !== "isNotEmpty" && !value.trim()) return;
      addFilter(columnId, "text", operator, value);
    };

    return (
      <div className="filter-popover">
        <div className="filter-header">
          <span>Filter {columnName}</span>
          <button onClick={() => setActiveFilterColumn(null)}>×</button>
        </div>
        <div className="filter-content">
          <select 
            value={operator} 
            onChange={(e) => setOperator(e.target.value as TextFilterOperator)}
            className="filter-operator"
          >
            <option value="contains">Contains</option>
            <option value="notContains">Not contains</option>
            <option value="equals">Equals</option>
            <option value="isEmpty">Is empty</option>
            <option value="isNotEmpty">Is not empty</option>
          </select>
          
          {(operator !== "isEmpty" && operator !== "isNotEmpty") && (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value..."
              className="filter-value"
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
          )}
          
          <button onClick={handleApply} className="apply-filter-btn">
            Apply Filter
          </button>
        </div>
      </div>
    );
  };

  const NumberFilterComponent = ({ columnId, columnName }: { columnId: string; columnName: string }) => {
    const [operator, setOperator] = useState<NumberFilterOperator>("equals");
    const [value, setValue] = useState("");

    const handleApply = () => {
      if (operator !== "isEmpty" && operator !== "isNotEmpty" && !value.trim()) return;
      addFilter(columnId, "number", operator, value || "0");
    };

    return (
      <div className="filter-popover">
        <div className="filter-header">
          <span>Filter {columnName}</span>
          <button onClick={() => setActiveFilterColumn(null)}>×</button>
        </div>
        <div className="filter-content">
          <select 
            value={operator} 
            onChange={(e) => setOperator(e.target.value as NumberFilterOperator)}
            className="filter-operator"
          >
            <option value="equals">Equals</option>
            <option value="gt">Greater than</option>
            <option value="lt">Less than</option>
            <option value="gte">Greater than or equal</option>
            <option value="lte">Less than or equal</option>
            <option value="isEmpty">Is empty</option>
            <option value="isNotEmpty">Is not empty</option>
          </select>
          
          {(operator !== "isEmpty" && operator !== "isNotEmpty") && (
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter number..."
              className="filter-value"
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
            />
          )}
          
          <button onClick={handleApply} className="apply-filter-btn">
            Apply Filter
          </button>
        </div>
      </div>
    );
  };


  const columns = useMemo<ColumnDef<any>[]>(() => {
    return data.columns.map(column => {
      const columnFilters = getColumnFilters(column.id);
      
      return {
        id: column.id,
        accessorKey: column.id,
        header: () => (
          <div className="column-header">
            <div className="column-title">
              <span className="column-name">{column.name}</span>
              <span className="column-type">({column.type})</span>
            </div>
            <div className="column-filter-section">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFilterColumn(activeFilterColumn === column.id ? null : column.id);
                }}
                className={`filter-btn ${columnFilters.length > 0 ? 'active' : ''}`}
                title="Filter column"
              >
                
                {columnFilters.length > 0 && (
                  <span className="filter-count">{columnFilters.length}</span>
                )}
              </button>
            </div>
            
            {}
            {columnFilters.length > 0 && (
              <div className="active-filters">
                {columnFilters.map(filter => (
                  <span key={filter.id} className="active-filter-tag">
                    {filter.operator}: {filter.value}
                    <button onClick={(e) => {
                      e.stopPropagation();
                      removeFilter(filter.id);
                    }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ),
        cell: (info: any) => {
          const rowId = info.row.original.id;
          const value = info.getValue();
          const isEditing = editingCell?.rowId === rowId && editingCell.columnId === column.id;

          const handleCellUpdate = (newValue: any) => {
            setData(prev => ({
              ...prev,
              rows: prev.rows.map(row => 
                row.id === rowId 
                  ? { ...row, [column.id]: newValue }
                  : row
              ),
            }));
          };

          if (isEditing) {
            return (
              <input
                type={column.type === "number" ? "number" : "text"}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  const finalValue = column.type === "number" ? Number(editValue) : editValue;
                  handleCellUpdate(finalValue);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const finalValue = column.type === "number" ? Number(editValue) : editValue;
                    handleCellUpdate(finalValue);
                    setEditingCell(null);
                  } else if (e.key === "Escape") {
                    setEditingCell(null);
                  } else if (e.key === "Tab") {
                    e.preventDefault();
                    const finalValue = column.type === "number" ? Number(editValue) : editValue;
                    handleCellUpdate(finalValue);
                  }
                }}
                autoFocus
                className="cell-input"
                onFocus={(e) => e.target.select()}
              />
            );
          }

          return (
            <div
              className="cell-content"
              onClick={() => {
                setEditingCell({ rowId, columnId: column.id });
                setEditValue(String(value || ""));
              }}
              style={{
                cursor: "pointer",
                padding: "8px 12px",
                height: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              {value}
            </div>
          );
        },
        size: 200,
      };
    });
  }, [data, editingCell, editValue, filters, activeFilterColumn, getColumnFilters, removeFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const { rows } = table.getRowModel();

  // Virtualizer for performance - FIXED with proper ref
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  if (virtualRows.length > 0) {
  const lastItem = virtualRows[virtualRows.length - 1];
  const nearBottom = lastItem.index >= data.length - 10;
  if (nearBottom && !isLoading && hasMoreData) {
    loadMoreData(); 
  }
}

  const totalSize = rowVirtualizer.getTotalSize();


  const addNewColumn = () => {
    if (!newColumnName.trim()) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: newColumnName,
      type: newColumnType,
    };

    setData(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      rows: prev.rows.map(row => ({
        ...row,
        [newColumn.id]: newColumnType === "number" ? 0 : "",
      })),
    }));

    setNewColumnName("");
    setNewColumnType("text");
  };

 
  const addNewRow = () => {
    const newRow: TableRow = { id: `row-${Date.now()}` };
    
    
    data.columns.forEach(column => {
      newRow[column.id] = column.type === "number" ? 0 : "";
    });

    setData(prev => ({
      ...prev,
      rows: [...prev.rows, newRow],
    }));
  };

  
  const add100kRows = async () => {
    setIsAddingBulkRows(true);
    
    setTimeout(() => {
      const bulkRows = createBulkRows(data.columns, 100000);
      setData(prev => ({
        ...prev,
        rows: [...prev.rows, ...bulkRows],
      }));
      setIsAddingBulkRows(false);
    }, 100);
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingCell) return;

      const currentRowIndex = data.rows.findIndex(row => row.id === editingCell.rowId);
      const currentColIndex = data.columns.findIndex(col => col.id === editingCell.columnId);

      if (e.key === "ArrowUp" && currentRowIndex > 0) {
        e.preventDefault();
        const prevRow = data.rows[currentRowIndex - 1];
        setEditingCell({ rowId: prevRow.id, columnId: editingCell.columnId });
        setEditValue(String(prevRow[editingCell.columnId] || ""));
      } else if (e.key === "ArrowDown" && currentRowIndex < data.rows.length - 1) {
        e.preventDefault();
        const nextRow = data.rows[currentRowIndex + 1];
        setEditingCell({ rowId: nextRow.id, columnId: editingCell.columnId });
        setEditValue(String(nextRow[editingCell.columnId] || ""));
      } else if (e.key === "ArrowLeft" && currentColIndex > 0) {
        e.preventDefault();
        const prevCol = data.columns[currentColIndex - 1];
        setEditingCell({ rowId: editingCell.rowId, columnId: prevCol.id });
        setEditValue(String(data.rows[currentRowIndex][prevCol.id] || ""));
      } else if (e.key === "ArrowRight" && currentColIndex < data.columns.length - 1) {
        e.preventDefault();
        const nextCol = data.columns[currentColIndex + 1];
        setEditingCell({ rowId: editingCell.rowId, columnId: nextCol.id });
        setEditValue(String(data.rows[currentRowIndex][nextCol.id] || ""));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editingCell, data]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeFilterColumn && !(event.target as Element).closest('.column-filter-section') && 
          !(event.target as Element).closest('.filter-popover')) {
        setActiveFilterColumn(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeFilterColumn]);

  return (
    <div className="data-table-container">
      {}
      <div className="table-header">
        <div className="table-title-section">
          <h2 className="table-title">{data.name}</h2>
          <button 
            onClick={() => createNewTable(`Table ${Date.now()}`)}
            className="new-table-btn"
          >
            New Table
          </button>
        </div>
        
        <div className="table-actions">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search across all cells..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            {filters.length > 0 && (
              <button onClick={clearAllFilters} className="clear-filters-btn">
                Clear All Filters ({filters.length})
              </button>
            )}
          </div>
          
          <div className="add-column-form">
            <input
              type="text"
              placeholder="New column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              className="column-input"
              onKeyDown={(e) => e.key === "Enter" && addNewColumn()}
            />
            <select 
              value={newColumnType} 
              onChange={(e) => setNewColumnType(e.target.value as ColumnType)}
              className="type-select"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
            </select>
            <button onClick={addNewColumn} className="add-column-btn">
              Add Column
            </button>
          </div>
          
          <div className="row-actions">
            <button onClick={addNewRow} className="add-row-btn">
              Add Row
            </button>
            <button 
              onClick={add100kRows} 
              className="add-bulk-btn"
              disabled={isAddingBulkRows}
            >
              {isAddingBulkRows ? "Adding..." : "Add 100k Rows"}
            </button>
          </div>
        </div>
      </div>

      {}
      {activeFilterColumn && (() => {
        const column = data.columns.find(col => col.id === activeFilterColumn);
        if (!column) return null;
        
        const columnElement = document.querySelector(`[data-column-id="${activeFilterColumn}"]`);
        if (!columnElement) return null;

        const rect = columnElement.getBoundingClientRect();
        
        return (
          <div 
            className="filter-popover-overlay"
            style={{
              position: 'fixed',
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
              zIndex: 1000,
            }}
          >
            {column.type === "text" ? (
              <TextFilterComponent columnId={column.id} columnName={column.name} />
            ) : (
              <NumberFilterComponent columnId={column.id} columnName={column.name} />
            )}
          </div>
        );
      })()}

      {}
      <div 
        ref={tableContainerRef}
        className="table-container"
        style={{
          height: '400px',
          overflow: 'auto',
          position: 'relative',
        }}
      >
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
                    data-column-id={header.id}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="table-body">
            {}
            {virtualRows.length > 0 && (
              <>
                <tr>
                  <td
                    style={{
                      height: virtualRows[0]?.start || 0,
                    }}
                  />
                </tr>
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
                            height: "40px",
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
                <tr>
                  <td
                    style={{
                      height: totalSize - (virtualRows[virtualRows.length - 1]?.end || 0),
                    }}
                  />
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {}
      <div className="table-info">
        <span>{filteredData.length} rows ({data.rows.length} total)</span>
        <span>{data.columns.length} columns</span>
        {filters.length > 0 && <span>{filters.length} active filters</span>}
        {searchTerm && <span>Search: "{searchTerm}"</span>}
      </div>
    </div>
  );
}