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

function FieldDropdownMenu({
  columnId,
  columnName,
  columnType,
  isOpen,
  onClose,
  position,
  onAddFilter,
  onEditField,
  onDuplicateField,
  onInsertLeft,
  onInsertRight,
  onDeleteField,
  onHideField,
  onSort,
  onGroupBy
}: {
  columnId: string;
  columnName: string;
  columnType: "text" | "number";
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  onAddFilter: (columnId: string, columnType: "text" | "number", operator: string, value: string) => void;
  onEditField: (columnId: string, newName: string) => void;
  onDuplicateField: (columnId: string) => void;
  onInsertLeft: (columnId: string) => void;
  onInsertRight: (columnId: string) => void;
  onDeleteField: (columnId: string) => void;
  onHideField: (columnId: string) => void;
  onSort: (columnId: string, direction: "asc" | "desc") => void;
  onGroupBy: (columnId: string) => void;
}) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editName, setEditName] = useState(columnName);
  const [filterOperator, setFilterOperator] = useState("contains");
  const [filterValue, setFilterValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFilterApply = () => {
    if (filterValue.trim() || filterOperator === "isEmpty" || filterOperator === "isNotEmpty") {
      onAddFilter(columnId, columnType, filterOperator, filterValue);
      setActiveSection(null);
    }
  };

  const handleEditField = () => {
    if (editName.trim() && editName !== columnName) {
      onEditField(columnId, editName);
    }
    setActiveSection(null);
  };

  const menuSections = [
    {
      title: "Sort",
      items: [
        {
          label: "Sort A → Z",
          icon: "↑",
          action: () => onSort(columnId, "asc")
        },
        {
          label: "Sort Z → A",
          icon: "↓",
          action: () => onSort(columnId, "desc")
        }
      ]
    },
    {
      title: "Filter",
      items: [
        {
          label: "Filter by this field",
          icon: "",
          action: () => setActiveSection("filter")
        }
      ]
    },
    {
      title: "Group",
      items: [
        {
          label: "Group by this field",
          icon: "",
          action: () => onGroupBy(columnId)
        }
      ]
    },
    {
      title: "Field",
      items: [
        {
          label: "Edit field",
          icon: "",
          action: () => setActiveSection("edit")
        },
        {
          label: "Duplicate field",
          icon: "",
          action: () => onDuplicateField(columnId)
        },
        {
          label: "Insert left",
          icon: "",
          action: () => onInsertLeft(columnId)
        },
        {
          label: "Insert right",
          icon: "",
          action: () => onInsertRight(columnId)
        },
        {
          label: "Hide field",
          icon: "",
          action: () => onHideField(columnId)
        },
        {
          label: "Delete field",
          icon: "",
          action: () => onDeleteField(columnId)
        }
      ]
    },
    {
      title: "Advanced",
      items: [
        {
          label: "Run field agent",
          icon: "",
          action: () => console.log("Run field agent for", columnId)
        },
        {
          label: "Summarize field",
          icon: "",
          action: () => console.log("Summarize field for", columnId)
        },
        {
          label: "Write headline",
          icon: "",
          action: () => console.log("Write headline for", columnId)
        },
        {
          label: "Copy field URL",
          icon: "",
          action: () => console.log("Copy URL for", columnId)
        },
        {
          label: "Edit description",
          icon: "",
          action: () => console.log("Edit description for", columnId)
        },
        {
          label: "Edit permissions",
          icon: "",
          action: () => console.log("Edit permissions for", columnId)
        },
        {
          label: "Show dependencies",
          icon: "",
          action: () => console.log("Show dependencies for", columnId)
        }
      ]
    }
  ];

  return (
    <div
      ref={dropdownRef}
      className="field-dropdown-menu"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '280px',
        maxWidth: '320px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
      }}
    >
      {}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        fontWeight: '600',
        color: '#2d2d2d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{columnName}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      {}
      {activeSection === "filter" && (
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ marginBottom: '12px', fontWeight: '500' }}>Filter by {columnName}</div>
          <select
            value={filterOperator}
            onChange={(e) => setFilterOperator(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="contains">Contains</option>
            <option value="notContains">Does not contain</option>
            <option value="equals">Is exactly</option>
            {columnType === "number" && (
              <>
                <option value="gt">Greater than</option>
                <option value="lt">Less than</option>
                <option value="gte">Greater than or equal to</option>
                <option value="lte">Less than or equal to</option>
              </>
            )}
            <option value="isEmpty">Is empty</option>
            <option value="isNotEmpty">Is not empty</option>
          </select>
          {(filterOperator !== "isEmpty" && filterOperator !== "isNotEmpty") && (
            <input
              type={columnType === "number" ? "number" : "text"}
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Enter value..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '12px'
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterApply()}
            />
          )}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setActiveSection(null)}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleFilterApply}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: '#1a73e8',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {activeSection === "edit" && (
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ marginBottom: '12px', fontWeight: '500' }}>Edit Field Name</div>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '12px'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleEditField()}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setActiveSection(null)}
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditField}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: '#1a73e8',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {menuSections.map((section, index) => (
          <div key={section.title}>
            <div style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderTop: index > 0 ? '1px solid #f0f0f0' : 'none'
            }}>
              {section.title}
            </div>
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#2d2d2d'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                <span style={{ fontSize: '16px', width: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

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

const createBulkRows = (columns: Column[], count: number = 100000): TableRow[] => {
  const rows: TableRow[] = [];
  for (let i = 0; i < count; i++) {
    const row: TableRow = { id: `bulk-row-${i}` };
    
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
    
    rows.push(row);
  }
  return rows;
};

export function DataTable({ initialData, onTableUpdate }: DataTableProps) {
  const [data, setData] = useState<TableData>(initialData || createDefaultTable());
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddingBulkRows, setIsAddingBulkRows] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const [activeFieldDropdown, setActiveFieldDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef(0);
  const loadedRowsRef = useRef<TableRow[]>([]);
  const allRowsRef = useRef<TableRow[]>([]);

  useEffect(() => {
    if (data.rows.length > 0) {
      allRowsRef.current = data.rows;
      loadedRowsRef.current = data.rows.slice(0, 100);
      currentPageRef.current = 1;
      setHasMore(data.rows.length > 100);
    }
  }, [data.id]);

  const loadMoreData = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 50));
    
    const startIndex = currentPageRef.current * 100;
    const endIndex = startIndex + 100;
    const newRows = allRowsRef.current.slice(startIndex, endIndex);
    
    if (newRows.length === 0) {
      setHasMore(false);
      setIsLoading(false);
      return;
    }
    
    loadedRowsRef.current = [...loadedRowsRef.current, ...newRows];
    currentPageRef.current += 1;
    
    setIsLoading(false);
    
    setData(prev => ({ ...prev }));
  }, [isLoading, hasMore]);

  const createNewTable = useCallback((tableName: string) => {
    const newTable = createDefaultTable(tableName);
    setData(newTable);
    setFilters([]);
    setHasMore(true);
    currentPageRef.current = 0;
    loadedRowsRef.current = [];
    allRowsRef.current = [];
    onTableUpdate?.(newTable);
  }, [onTableUpdate]);

  const tableData = useMemo(() => {
    return loadedRowsRef.current.map(row => ({
      ...row,
      _original: row
    }));
  }, [loadedRowsRef.current]);

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

  const rowVirtualizer = useVirtualizer({
    count: filteredData.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, 
    overscan: 5, 
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    const nearBottom = lastItem.index >= filteredData.length - 10;
    
    if (nearBottom && !isLoading && hasMore) {
      loadMoreData();
    }
  }, [rowVirtualizer.getVirtualItems(), filteredData.length, isLoading, hasMore, loadMoreData]);

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

  const handleFieldMenuOpen = (columnId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    });
    setActiveFieldDropdown(columnId);
    setActiveFilterColumn(null); 
  };

  const handleFieldMenuClose = () => {
    setActiveFieldDropdown(null);
  };

  const handleEditField = (columnId: string, newName: string) => {
    setData(prev => ({
      ...prev,
      columns: prev.columns.map(col => 
        col.id === columnId ? { ...col, name: newName } : col
      )
    }));
  };

  const handleDuplicateField = (columnId: string) => {
    const columnToDuplicate = data.columns.find(col => col.id === columnId);
    if (!columnToDuplicate) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: `${columnToDuplicate.name} Copy`,
      type: columnToDuplicate.type,
    };

    setData(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      rows: prev.rows.map(row => ({
        ...row,
        [newColumn.id]: columnToDuplicate.type === "number" ? 0 : "",
      })),
    }));

    loadedRowsRef.current = loadedRowsRef.current.map(row => ({
      ...row,
      [newColumn.id]: columnToDuplicate.type === "number" ? 0 : "",
    }));
  };

  const handleInsertLeft = (columnId: string) => {
    const columnIndex = data.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: "New Column",
      type: "text",
    };

    const newColumns = [...data.columns];
    newColumns.splice(columnIndex, 0, newColumn);

    setData(prev => ({
      ...prev,
      columns: newColumns,
      rows: prev.rows.map(row => ({
        ...row,
        [newColumn.id]: "",
      })),
    }));

    loadedRowsRef.current = loadedRowsRef.current.map(row => ({
      ...row,
      [newColumn.id]: "",
    }));
  };

  const handleInsertRight = (columnId: string) => {
    const columnIndex = data.columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: "New Column",
      type: "text",
    };

    const newColumns = [...data.columns];
    newColumns.splice(columnIndex + 1, 0, newColumn);

    setData(prev => ({
      ...prev,
      columns: newColumns,
      rows: prev.rows.map(row => ({
        ...row,
        [newColumn.id]: "",
      })),
    }));

    loadedRowsRef.current = loadedRowsRef.current.map(row => ({
      ...row,
      [newColumn.id]: "",
    }));
  };

  const handleDeleteField = (columnId: string) => {
    if (data.columns.length <= 1) {
      alert("Cannot delete the last column");
      return;
    }

    if (window.confirm("Are you sure you want to delete this column?")) {
      setData(prev => ({
        ...prev,
        columns: prev.columns.filter(col => col.id !== columnId),
        rows: prev.rows.map(row => {
          const { [columnId]: deleted, ...rest } = row;
          return rest;
        }),
      }));

      loadedRowsRef.current = loadedRowsRef.current.map(row => {
        const { [columnId]: deleted, ...rest } = row;
        return rest;
      });
    }
  };

  const handleHideField = (columnId: string) => {
    console.log("Hide field:", columnId);
  };

  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    const sortedRows = [...data.rows].sort((a, b) => {
      const aVal = a[columnId];
      const bVal = b[columnId];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === "asc" 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return direction === "asc" 
        ? (aVal || 0) - (bVal || 0)
        : (bVal || 0) - (aVal || 0);
    });

    setData(prev => ({
      ...prev,
      rows: sortedRows,
    }));

    allRowsRef.current = sortedRows;
    loadedRowsRef.current = sortedRows.slice(0, 100);
    currentPageRef.current = 1;
  };

  const handleGroupBy = (columnId: string) => {
    console.log("Group by field:", columnId);
  };

  const addNewField = () => {
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: "New Field",
      type: "text",
    };

    const updatedRows = allRowsRef.current.map(row => ({
      ...row,
      [newColumn.id]: newColumn.type === "number" ? 0 : "",
    }));

    allRowsRef.current = updatedRows;
    loadedRowsRef.current = updatedRows.slice(0, 100);

    setData(prev => ({
      ...prev,
      columns: [...prev.columns, newColumn],
      rows: updatedRows,
    }));
  };

  const addNewRow = () => {
    const newRow: TableRow = { id: `row-${Date.now()}` };
    
    data.columns.forEach(column => {
      newRow[column.id] = column.type === "number" ? 0 : "";
    });

    const updatedRows = [...allRowsRef.current, newRow];
    allRowsRef.current = updatedRows;
    loadedRowsRef.current = updatedRows.slice(0, 100);

    setData(prev => ({
      ...prev,
      rows: updatedRows,
    }));
  };

  const add100kRows = async () => {
    setIsAddingBulkRows(true);
    
    requestAnimationFrame(() => {
      const bulkRows = createBulkRows(data.columns, 100000);
      const updatedRows = [...allRowsRef.current, ...bulkRows];
      
      allRowsRef.current = updatedRows;
      loadedRowsRef.current = updatedRows.slice(0, 100);
      currentPageRef.current = 1;
      setHasMore(true);
      
      setData(prev => ({
        ...prev,
        rows: updatedRows,
      }));
      
      setIsAddingBulkRows(false);
    });
  };

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
          <div className="column-header" style={{ position: 'relative' }}>
            <div className="column-title">
              <span className="column-name">{column.name}</span>
              <span className="column-type">({column.type})</span>
            </div>
            <div className="column-actions" style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFilterColumn(activeFilterColumn === column.id ? null : column.id);
                }}
                className={`filter-btn ${columnFilters.length > 0 ? 'active' : ''}`}
                title="Filter column"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                ⚙️
                {columnFilters.length > 0 && (
                  <span className="filter-count" style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#0052cc',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {columnFilters.length}
                  </span>
                )}
              </button>
              <button
                onClick={(e) => handleFieldMenuOpen(column.id, e)}
                title="Field options"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                ⋮
              </button>
            </div>
            
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
            allRowsRef.current = allRowsRef.current.map(row =>
              row.id === rowId 
                ? { ...row, [column.id]: newValue }
                : row
            );
      
            loadedRowsRef.current = loadedRowsRef.current.map(row =>
              row.id === rowId 
                ? { ...row, [column.id]: newValue }
                : row
            );
         
            setData(prev => ({
              ...prev,
              rows: allRowsRef.current,
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
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  outline: 'none',
                  padding: '8px 12px',
                  margin: 0,
                  font: 'inherit',
                  boxSizing: 'border-box',
                }}
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
                width: '100%',
                boxSizing: 'border-box',
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!editingCell) return;

      const currentRowIndex = allRowsRef.current.findIndex(row => row.id === editingCell.rowId);
      const currentColIndex = data.columns.findIndex(col => col.id === editingCell.columnId);

      if (e.key === "ArrowUp" && currentRowIndex > 0) {
        e.preventDefault();
        const prevRow = allRowsRef.current[currentRowIndex - 1];
        setEditingCell({ rowId: prevRow.id, columnId: editingCell.columnId });
        setEditValue(String(prevRow[editingCell.columnId] || ""));
      } else if (e.key === "ArrowDown" && currentRowIndex < allRowsRef.current.length - 1) {
        e.preventDefault();
        const nextRow = allRowsRef.current[currentRowIndex + 1];
        setEditingCell({ rowId: nextRow.id, columnId: editingCell.columnId });
        setEditValue(String(nextRow[editingCell.columnId] || ""));
      } else if (e.key === "ArrowLeft" && currentColIndex > 0) {
        e.preventDefault();
        const prevCol = data.columns[currentColIndex - 1];
        setEditingCell({ rowId: editingCell.rowId, columnId: prevCol.id });
        setEditValue(String(allRowsRef.current[currentRowIndex][prevCol.id] || ""));
      } else if (e.key === "ArrowRight" && currentColIndex < data.columns.length - 1) {
        e.preventDefault();
        const nextCol = data.columns[currentColIndex + 1];
        setEditingCell({ rowId: editingCell.rowId, columnId: nextCol.id });
        setEditValue(String(allRowsRef.current[currentRowIndex][nextCol.id] || ""));
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
      <div className="airtable-header">
        <div className="header-left">
          <div className="workspace-tabs">
            <button className="tab active">Table 1</button>
            <button className="tab-add">+</button>
          </div>
          <div className="add-import-section">
            <button className="add-import-btn">
              <span>Add or import</span>
              <span className="plus-icon">+</span>
            </button>
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button className="header-btn hide-fields" title="Hide fields">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            </button>
            
            <button className="header-btn filter" title="Filter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
            </button>
            
            <button className="header-btn group" title="Group">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 15h8v-2H3v2zm0 4h8v-2H3v2zm0 4h8v-2H3v2zm10 0h8v-2h-8v2zm0-10v2h8v-2h-8zm0 4h8v-2h-8v2z"/>
              </svg>
            </button>
            
            <button className="header-btn sort" title="Sort">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
              </svg>
            </button>
            
            <button className="header-btn color" title="Color">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-2a8 8 0 100-16 8 8 0 000 16z"/>
              </svg>
            </button>
          </div>
          
          <div className="header-divider"></div>
          
          <div className="share-sync-section">
            <button className="header-btn share" title="Share">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
              </svg>
              Share
            </button>
            
            <button className="header-btn sync" title="Sync">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
              </svg>
            </button>
          </div>
          
          <div className="tools-menu">
            <button className="tools-btn">Tools</button>
          </div>
        </div>
      </div>

      {}
      <div className="table-toolbar">
  <div className="toolbar-left">
    <div className="search-section">
      <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <input
        type="text"
        placeholder="Search across all cells..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
    
    {}
    <button 
      className="new-table-btn"
      onClick={() => createNewTable(`Table ${Date.now()}`)}
    >
      New Table
    </button>
  </div>
  
  <div className="toolbar-right">
    <button 
      onClick={add100kRows} 
      className="add-bulk-btn"
      disabled={isAddingBulkRows}
    >
      {isAddingBulkRows ? "Adding..." : "Add 100k Rows"}
    </button>
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

      {activeFieldDropdown && (() => {
        const column = data.columns.find(col => col.id === activeFieldDropdown);
        if (!column) return null;
        
        return (
          <FieldDropdownMenu
            columnId={column.id}
            columnName={column.name}
            columnType={column.type}
            isOpen={true}
            onClose={handleFieldMenuClose}
            position={dropdownPosition}
            onAddFilter={addFilter}
            onEditField={handleEditField}
            onDuplicateField={handleDuplicateField}
            onInsertLeft={handleInsertLeft}
            onInsertRight={handleInsertRight}
            onDeleteField={handleDeleteField}
            onHideField={handleHideField}
            onSort={handleSort}
            onGroupBy={handleGroupBy}
          />
        );
      })()}

      {}
      <div 
        ref={tableContainerRef}
        className="table-container"
        style={{
          height: '600px',
          overflow: 'auto',
          position: 'relative',
          border: '1px solid #e2e8f0',
        }}
      >
        <table 
          className="data-table" 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            position: 'relative',
          }}
        >
          <thead 
            className="table-head" 
            style={{ 
              position: 'sticky', 
              top: 0, 
              background: 'white', 
              zIndex: 1,
            }}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-header-cell"
                    style={{
                      width: header.getSize(),
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      fontWeight: '600',
                      textAlign: 'left',
                      verticalAlign: 'middle',
                      position: 'relative',
                      height: '40px',
                      boxSizing: 'border-box',
                    }}
                    data-column-id={header.id}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
                {}
                <th
                  className="add-field-header"
                  style={{
                    width: '150px',
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontWeight: '600',
                    textAlign: 'left',
                    verticalAlign: 'middle',
                    position: 'relative',
                    height: '40px',
                    boxSizing: 'border-box',
                  }}
                >
                  <button 
                    className="add-field-btn"
                    onClick={addNewField}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Add Field
                  </button>
                </th>
              </tr>
            ))}
          </thead>
          <tbody 
            style={{
              height: `${totalSize}px`,
              display: 'block',
            }}
          >
            {}
            <tr>
              <td colSpan={data.columns.length + 1} style={{ 
                height: `${virtualRows[0]?.start || 0}px`,
                display: 'block',
                padding: 0,
                margin: 0,
              }} />
            </tr>

            {}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;

              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="table-row"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'table',
                    tableLayout: 'fixed',
                    height: '40px',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="table-cell"
                      style={{
                        width: cell.column.getSize(),
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        verticalAlign: 'middle',
                        height: '40px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  {}
                  <td
                    className="table-cell"
                    style={{
                      width: '150px',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      verticalAlign: 'middle',
                      height: '40px',
                      boxSizing: 'border-box',
                    }}
                  ></td>
                </tr>
              );
            })}

            {}
            <tr>
              <td colSpan={data.columns.length + 1} style={{ 
                height: `${totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)}px`,
                display: 'block',
                padding: 0,
                margin: 0,
              }} />
            </tr>
          </tbody>
        </table>
        
        {}
        {isLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '10px',
            position: 'sticky',
            bottom: 0,
            background: 'white',
            borderTop: '1px solid #e2e8f0'
          }}>
            Loading more data...
          </div>
        )}
        
        {}
        {!hasMore && filteredData.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '10px',
            position: 'sticky',
            bottom: 0,
            background: 'white',
            borderTop: '1px solid #e2e8f0'
          }}>
            All data loaded
          </div>
        )}
      </div>

      {}
      <div className="table-info">
        <span>{filteredData.length} rows displayed ({allRowsRef.current.length} total)</span>
        <span>{data.columns.length} columns</span>
        {filters.length > 0 && <span>{filters.length} active filters</span>}
        {searchTerm && <span>Search: "{searchTerm}"</span>}
      </div>
    </div>
  );
}