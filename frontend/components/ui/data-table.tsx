'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render?: (item: T, index: number) => React.ReactNode;
  searchable?: boolean;
  sortable?: boolean;
  getValue?: (item: T) => string | number | boolean | null | undefined;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchable?: boolean;
  sortable?: boolean;
  pageSize?: number;
  paginated?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
  // Server-side pagination props
  serverPagination?: boolean;
  serverTotal?: number;
  serverPage?: number;
  onServerPageChange?: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Buscar...',
  searchable = true,
  sortable = true,
  pageSize = 10,
  paginated = true,
  emptyMessage = 'No hay datos para mostrar',
  emptyIcon,
  isLoading = false,
  loadingComponent,
  onRowClick,
  rowClassName,
  headerActions,
  footerContent,
  className,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  serverPagination = false,
  serverTotal = 0,
  serverPage = 1,
  onServerPageChange,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn ?? null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  const searchableColumns = useMemo(
    () => columns.filter((col) => col.searchable !== false),
    [columns]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      searchableColumns.some((col) => {
        const value = col.getValue
          ? col.getValue(item)
          : (item as Record<string, unknown>)[col.key];
        return String(value ?? '').toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, searchableColumns]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const column = columns.find((col) => col.key === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = column.getValue
        ? column.getValue(a)
        : (a as Record<string, unknown>)[column.key];
      const bValue = column.getValue
        ? column.getValue(b)
        : (b as Record<string, unknown>)[column.key];

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // For server pagination, use serverTotal; for client pagination, use sortedData.length
  const effectiveTotal = serverPagination ? serverTotal : sortedData.length;
  const totalPages = paginated ? Math.ceil(effectiveTotal / pageSize) : 1;
  const effectivePage = serverPagination ? serverPage : currentPage;

  const paginatedData = useMemo(() => {
    // With server pagination, data is already paginated from backend
    if (serverPagination) return sortedData;
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, paginated, serverPagination]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column || column.sortable === false) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getRowClassName = (item: T): string => {
    const base = onRowClick ? 'cursor-pointer' : '';
    const custom = typeof rowClassName === 'function' ? rowClassName(item) : rowClassName;
    return cn(base, custom);
  };

  const renderCellContent = (item: T, column: DataTableColumn<T>, index: number) => {
    if (column.render) {
      return column.render(item, index);
    }
    const value = (item as Record<string, unknown>)[column.key];
    return value !== null && value !== undefined ? String(value) : '-';
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!sortable || column?.sortable === false) return null;

    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-foreground" />
    ) : (
      <ArrowDown className="h-4 w-4 text-foreground" />
    );
  };

  const isColumnSortable = (column: DataTableColumn<T>) => {
    return sortable && column.sortable !== false;
  };

  if (isLoading) {
    return (
      loadingComponent || (
        <Card className="p-12 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        </Card>
      )
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {(searchable || headerActions) && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between gap-4">
            {searchable && (
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {paginatedData.length === 0 ? (
        <div className="p-12 text-center">
          {emptyIcon && <div className="mb-4 flex justify-center">{emptyIcon}</div>}
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.headerClassName,
                      isColumnSortable(column) && 'cursor-pointer select-none hover:bg-muted/50'
                    )}
                    onClick={() => isColumnSortable(column) && handleSort(column.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-2',
                      column.headerClassName?.includes('text-center') && 'justify-center',
                      column.headerClassName?.includes('text-right') && 'justify-end'
                    )}>
                      {column.header}
                      <SortIcon columnKey={column.key} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={keyExtractor(item)}
                  className={getRowClassName(item)}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {renderCellContent(item, column, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(paginated && totalPages > 1) || footerContent ? (
        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {paginatedData.length} de {effectiveTotal}
            {!serverPagination && sortedData.length !== data.length && ` (${data.length} total)`}
          </div>
          <div className="flex items-center gap-2">
            {footerContent}
            {paginated && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (serverPagination && onServerPageChange) {
                      onServerPageChange(Math.max(1, effectivePage - 1));
                    } else {
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }
                  }}
                  disabled={effectivePage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">
                  {effectivePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (serverPagination && onServerPageChange) {
                      onServerPageChange(Math.min(totalPages, effectivePage + 1));
                    } else {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }
                  }}
                  disabled={effectivePage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
