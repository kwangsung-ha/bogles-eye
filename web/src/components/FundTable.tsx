import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
} from '@tanstack/react-table';
import type { Fund } from '../types/fund';
import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

const columnHelper = createColumnHelper<Fund>();

const columns = [
  columnHelper.accessor('company_name', {
    header: 'Company',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('fund_name', {
    header: 'Fund Name',
    cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor('ter', {
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          TER (%)
          <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell: (info) => <span className="font-bold text-blue-600">{info.getValue()}%</span>,
  }),
  columnHelper.accessor('management_fees', {
    header: 'Mgmt Fee',
    cell: (info) => `${info.getValue()}%`,
  }),
  columnHelper.accessor('trading_fee_ratio', {
    header: 'Trading Fee',
    cell: (info) => `${info.getValue()}%`,
  }),
];

interface FundTableProps {
  data: Fund[];
}

export function FundTable({ data }: FundTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
