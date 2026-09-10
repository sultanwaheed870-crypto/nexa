export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

export const createPagination = (
  page: number,
  pageSize: number,
  total: number,
): Pagination => {
  return {
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  };
};
