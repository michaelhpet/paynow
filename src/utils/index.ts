import { Pagination } from "../types";

export function getPagination(
  pagination: Pagination,
  count: number,
  total_records: number
) {
  let { page = 1, limit = 20 } = pagination;

  const total_pages = Math.ceil(total_records / limit);
  const has_previous = Boolean(page - 1);
  const has_next = total_pages > page;

  let start = page;
  if (page > 1) start = limit * (page - 1) + 1;
  let end = start + limit - 1;
  if (start > total_records) start = total_records;
  if (end > total_records) end = total_records;

  return {
    page,
    limit,
    count,
    total_pages,
    total_records,
    has_previous,
    has_next,
    description: `${start} to ${end} of ${total_records}`,
  };
}

export function success<T>(data: T, message: string) {
  return { status: "success", message, data };
}

export class AppError extends Error {
  code: number;
  status: string;
  statusCode?: number;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.status = code >= 400 && code < 500 ? "fail" : "error";
  }
}
