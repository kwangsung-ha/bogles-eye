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

const formatPct = (val: number) => (val != null ? `${val.toFixed(4)}%` : '-');

const columns = [
  columnHelper.accessor('company_name', {
    header: '운용사',
    cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
  }),
  columnHelper.accessor('fund_name', {
    header: '펀드명',
    cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
  }),
  // A Group (Grouped under '보수율')
  columnHelper.group({
    header: '보수율',
    columns: [
      columnHelper.accessor('management_fees', {
        header: '운용',
        cell: (info) => formatPct(info.getValue()),
      }),
      columnHelper.accessor('sales_fees', {
        header: '판매',
        cell: (info) => formatPct(info.getValue()),
      }),
      columnHelper.accessor('custody_fees', {
        header: '수탁',
        cell: (info) => formatPct(info.getValue()),
      }),
      columnHelper.accessor('office_admin_fees', {
        header: '사무',
        cell: (info) => formatPct(info.getValue()),
      }),
      columnHelper.accessor((row) => row.management_fees + row.sales_fees + row.custody_fees + row.office_admin_fees, {
        id: 'total_fees_a',
        header: '합계(A)',
        cell: (info) => <span className="font-semibold">{formatPct(info.getValue())}</span>,
      }),
    ],
  }),
  // B Group
  columnHelper.accessor('other_expenses', {
    header: '기타비용(B)',
    cell: (info) => formatPct(info.getValue()),
  }),
  // A+B
  columnHelper.accessor('ter', {
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900 font-bold"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          TER(A+B)
          <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell: (info) => <span className="text-blue-600 font-medium">{formatPct(info.getValue())}</span>,
  }),
  // C Group
  columnHelper.accessor('front_end_commission', {
    header: '선취(C)',
    cell: (info) => formatPct(info.getValue()),
  }),
  columnHelper.accessor('back_end_commission', {
    header: '후취(C)',
    cell: (info) => formatPct(info.getValue()),
  }),
  // D Group
  columnHelper.accessor('trading_fee_ratio', {
    header: '매매(D)',
    cell: (info) => formatPct(info.getValue()),
  }),
  // Final Total
  columnHelper.accessor((row) => {
    // TER usually includes A + B.
    // Total Cost = TER + FrontEnd + BackEnd + TradingFee
    return row.ter + row.front_end_commission + row.back_end_commission + row.trading_fee_ratio;
  }, {
    id: 'real_total_cost',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 hover:text-gray-900 font-extrabold text-blue-700"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          총비용(A+B+C+D)
          <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell: (info) => <span className="font-extrabold text-blue-700">{formatPct(info.getValue())}</span>,
  }),
];

interface FundTableProps {
  data: Fund[];
}

export function FundTable({ data }: FundTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'real_total_cost', desc: false } // Default sort by lowest total cost
  ]);

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
                  className="px-3 py-3.5 text-left text-xs font-semibold text-gray-900 whitespace-nowrap"
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
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
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
