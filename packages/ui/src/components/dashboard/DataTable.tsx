"use client";

import { useState, useMemo, type ReactNode } from "react";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Skeleton,
  Pagination,
  EmptyState,
} from "@nova/design-system";
import { Search } from "@nova/design-system";
import { cn } from "@nova/utils";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyField: keyof T;
  loading?: boolean;
  loadingRows?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  paginate?: boolean;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  caption?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

type SortDir = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  loading = false,
  loadingRows = 5,
  searchable = false,
  searchPlaceholder = "Search…",
  searchKeys,
  paginate = false,
  pageSize = 10,
  emptyTitle = "No results",
  emptyDescription,
  emptyIcon,
  caption,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") setSortDir("desc");
    else {
      setSortKey(null);
      setSortDir(null);
    }
    setPage(1);
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    const keys = searchKeys ?? columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((k) =>
        String(row[k] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [data, query, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    function toStr(v: unknown): string {
      if (v === null || v === undefined) return "";
      if (typeof v === "string") return v;
      if (typeof v === "number" || typeof v === "boolean") return `${v}`;
      return "";
    }
    return [...filtered].sort((a, b) => {
      const cmp = toStr(a[sortKey]).localeCompare(toStr(b[sortKey]), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = paginate ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {searchable && (
        <div className="w-full max-w-xs">
          <Search
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            inputSize="sm"
          />
        </div>
      )}

      <Table caption={caption}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableHeaderCell
                key={String(col.key)}
                sortable={col.sortable}
                sortDirection={sortKey === col.key ? sortDir : null}
                onSort={() => col.sortable && handleSort(String(col.key))}
                style={{ width: col.width, textAlign: col.align ?? "left" }}
              >
                {col.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {loading
            ? Array.from({ length: loadingRows }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : paged.map((row, i) => (
                <TableRow
                  key={String(row[keyField])}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} style={{ textAlign: col.align ?? "left" }}>
                      {col.render ? col.render(row, i) : String(row[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {!loading && paged.length === 0 && (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          className="rounded-none border-0"
        />
      )}

      {paginate && totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
