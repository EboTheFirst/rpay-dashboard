import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface Props {
  data: Record<string, any>[];
  defaultPageSize?: number;
}

export default function PaginatedSortableTable({
  data,
  defaultPageSize = 5,
}: Props) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Set default sort column to the first key in the data, if not set
  useEffect(() => {
    if (data.length && !sortBy) {
      setSortBy(Object.keys(data[0])[0]);
    }
  }, [data, sortBy]);

  const pageSize = defaultPageSize;

  const sortedData = useMemo(() => {
    if (!sortBy) return [...data];
    const sorted = [...data].sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      return sortOrder === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return sorted;
  }, [data, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return "↕";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (!data?.length) {
    return <div className="text-sm text-muted-foreground">No data available</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {Object.keys(paginatedData[0]).map((key) => (
              <TableHead
                key={key}
                onClick={() => handleSort(key)}
                className="cursor-pointer select-none uppercase text-muted-foreground hover:underline"
              >
                {key.replace(/_/g, " ")} {getSortIcon(key)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item, index) => (
            <TableRow key={index}>
              {Object.keys(item).map((key) => (
                <TableCell key={key} className="font-medium">
                  {item[key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
