export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginatedResult<T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    data,
    meta: {
      page,
      limit,
      total_items: totalItems,
      total_pages: totalPages,
    },
  };
}
