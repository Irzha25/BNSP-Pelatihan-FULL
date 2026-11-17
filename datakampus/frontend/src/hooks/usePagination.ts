import { useState } from "react";

export function usePagination<T>(items: T[], pageSize: number) {
  const [requestedPage, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, setPage, pageItems };
}
