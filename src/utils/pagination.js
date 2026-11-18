import { PAGINATION } from '../constants/index.js';
import { createError, ErrorDictionary } from './errors.js';

const parsePositiveInt = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return NaN;
  return Number(value);
};

export const parsePagination = (query = {}) => {
  const page = parsePositiveInt(query.page, PAGINATION.DEFAULT_PAGE);
  const limit = parsePositiveInt(query.limit, PAGINATION.DEFAULT_LIMIT);

  const valid = Number.isInteger(page) && Number.isInteger(limit) && page >= 1 && limit >= 1 && limit <= PAGINATION.MAX_LIMIT;
  if (!valid) throw createError(ErrorDictionary.INVALID_PAGINATION);

  return { page, limit, skip: (page - 1) * limit };
};

export const buildPagination = ({ page, limit }, total) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
};

// Un filtro de enum solo vale si llega como string y esta en la lista.
export const pickEnumFilter = (value, allowed, errorEntry) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !allowed.includes(value)) throw createError(errorEntry);
  return value;
};

// Los ids tambien tienen que ser string para que no se cuelen operadores de Mongo (?customer[$ne]=x).
export const pickIdFilter = (value) => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw createError(ErrorDictionary.INVALID_ID);
  return value;
};

export const pickBooleanFilter = (value) => {
  if (value === undefined) return undefined;
  if (value !== 'true' && value !== 'false') throw createError(ErrorDictionary.INVALID_FILTER);
  return value === 'true';
};
