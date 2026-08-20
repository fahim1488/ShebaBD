import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  totalItems: number;
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  skip: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  pageNumbers: number[];
}

/**
 * usePagination — manages pagination state for lists and tables.
 *
 * @example
 * const { currentPage, skip, hasNext, hasPrev, nextPage, prevPage } = usePagination({ totalItems: 100 });
 */
export function usePagination({
  totalItems,
  pageSize = 10,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize],
  );

  const skip = (currentPage - 1) * pageSize;

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    pageSize,
    skip,
    hasNext:   currentPage < totalPages,
    hasPrev:   currentPage > 1,
    goToPage,
    nextPage:  () => goToPage(currentPage + 1),
    prevPage:  () => goToPage(currentPage - 1),
    firstPage: () => goToPage(1),
    lastPage:  () => goToPage(totalPages),
    pageNumbers,
  };
}
// Murad: Skipped offset math
