import React, { useState } from 'react';
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  columns,
  type RentalContractData,
  getContractStatusBadgeVariant,
} from './rental-contracts-columns';

// Contract status options for filtering
const contractStatusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Terminated', value: 'TERMINATED' },
  { label: 'Renewed', value: 'RENEWED' },
];

// Payment frequency options for filtering
const paymentFrequencyOptions = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'BIWEEKLY', value: 'BIWEEKLY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Annual', value: 'ANNUAL' },
];

interface RentalContractsTableProps {
  contracts: RentalContractData[];
  onViewContract: (contract: RentalContractData) => void;
  onEditContract: (contract: RentalContractData) => void;
  onDeleteContract: (contract: RentalContractData) => void;
  searchPlaceholder?: string;
}

export function RentalContractsTable({
  contracts,
  onViewContract,
  onEditContract,
  onDeleteContract,
  searchPlaceholder = 'Search contracts...',
}: RentalContractsTableProps) {
  // State for table features
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Create table instance
  const table = useReactTable({
    data: contracts,
    columns: columns(onViewContract, onEditContract, onDeleteContract),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handle status filter changes
  const handleStatusFilterChange = (status: string) => {
    if (status === 'all') {
      table.getColumn('status')?.setFilterValue(null);
    } else {
      table.getColumn('status')?.setFilterValue(status);
    }
  };

  // Handle payment frequency filter changes
  const handleFrequencyFilterChange = (frequency: string) => {
    if (frequency === 'all') {
      table.getColumn('paymentFrequency')?.setFilterValue(null);
    } else {
      table.getColumn('paymentFrequency')?.setFilterValue(frequency);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setGlobalFilter('');
    table.resetColumnFilters();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-end gap-3 md:flex-row">
        <div className="flex-1">
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="w-full md:w-[180px]">
          <Select onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {contractStatusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getContractStatusBadgeVariant(status.value)}
                      className="h-2 w-2 rounded-full p-0"
                    />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-[180px]">
          <Select onValueChange={handleFrequencyFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Payment Frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              {paymentFrequencyOptions.map(frequency => (
                <SelectItem key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        {(globalFilter || columnFilters.length > 0) && (
          <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
            Clear filters
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No contracts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length}{' '}
          contract(s)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
