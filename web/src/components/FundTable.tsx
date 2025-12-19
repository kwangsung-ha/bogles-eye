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

const formatPct = (val: number) => (val != null ? val.toFixed(4) : '-');

const columns = [
  // Group: 기본정보
  columnHelper.group({
    header: '기본정보',
    columns: [
      columnHelper.accessor('company_name', {
        header: '운용사',
        cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor('fund_name', {
        header: '펀드명',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
    ],
  }),
  // Group: 최종비용
  columnHelper.group({
    header: '최종비용',
    columns: [
      columnHelper.accessor((row) => {
        // TER usually includes A + B.
        // Total Cost = TER + FrontEnd + BackEnd + TradingFee
        return row.ter + row.front_end_commission + row.back_end_commission + row.trading_fee_ratio;
      }, {
        id: 'real_total_cost',
        header: ({ column }) => {
          return (
            <button
              className="flex items-center justify-center gap-1 hover:text-gray-900 font-extrabold text-blue-700 w-full"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              총비용
              <br />
              (A+B+C+D)%
              <ArrowUpDown className="h-4 w-4" />
            </button>
          )
        },
        cell: (info) => <span className="font-extrabold text-blue-700">{formatPct(info.getValue())}</span>,
      }),
    ],
  }),
  // Group: 보수율
  columnHelper.group({
    header: '보수율(%)',
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
  // 기타비용 (단일 컬럼)
  columnHelper.accessor('other_expenses', {
    header: (
      <>
        기타비용
        <br />
        (B)%
      </>
    ),
    cell: (info) => formatPct(info.getValue()),
  }),
  // Group: TER
  columnHelper.group({
    header: 'TER',
    columns: [
      columnHelper.accessor('ter', {
        header: ({ column }) => {
          return (
            <button
              className="flex items-center justify-center gap-1 hover:text-gray-900 font-bold w-full"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              TER
              <br />
              (A+B)%
              <ArrowUpDown className="h-4 w-4" />
            </button>
          )
        },
        cell: (info) => <span className="text-blue-600 font-medium">{formatPct(info.getValue())}</span>,
      }),
    ],
  }),
  // Group: 판매수수료
  columnHelper.group({
    header: '판매수수료(%)(C)',
    columns: [
      columnHelper.accessor('front_end_commission', {
        header: '선취',
        cell: (info) => formatPct(info.getValue()),
      }),
      columnHelper.accessor('back_end_commission', {
        header: '후취',
        cell: (info) => formatPct(info.getValue()),
      }),
    ],
  }),
  // Group: 매매비용
  columnHelper.group({
    header: '매매비용(%)',
    columns: [
      columnHelper.accessor('trading_fee_ratio', {
        header: (
          <>
            매매.중개수수료
            <br />
            (D)%
          </>
        ),
        cell: (info) => formatPct(info.getValue()),
      }),
    ],
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
  const headerRowCount = table.getHeaderGroups().length;
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300 border border-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isRootLeafColumn =
                  header.column.depth === 0 && header.column.columns.length === 0;
                const isTopRow = headerGroup.depth === 0;
                const isSingleLeafGroup =
                  header.subHeaders.length === 1 && header.subHeaders[0].subHeaders.length === 0;
                if (header.isPlaceholder) {
                  if (isRootLeafColumn && isTopRow) {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        rowSpan={headerRowCount}
                        className="px-2 py-2 text-center text-[11px] font-semibold text-gray-900 whitespace-nowrap border border-gray-300"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  }

                  if (isRootLeafColumn) {
                    return null;
                  }

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="px-2 py-2 text-center text-[11px] font-semibold text-gray-900 whitespace-nowrap border border-gray-300"
                    />
                  );
                }

                if (isTopRow && isSingleLeafGroup) {
                  const leafHeader = header.subHeaders[0];

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      rowSpan={headerRowCount}
                      className="px-2 py-2 text-center text-[11px] font-semibold text-gray-900 whitespace-nowrap border border-gray-300"
                    >
                      {flexRender(leafHeader.column.columnDef.header, leafHeader.getContext())}
                    </th>
                  );
                }

                if (
                  !isTopRow &&
                  header.column.depth === 1 &&
                  header.column.parent?.columns.length === 1
                ) {
                  return null;
                }

                if (isRootLeafColumn && !isTopRow) {
                  return null;
                }

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-2 py-2 text-center text-[11px] font-semibold text-gray-900 whitespace-nowrap border border-gray-300"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="whitespace-nowrap px-2 py-2 text-[12px] text-gray-500 border-r border-gray-100 last:border-r-0 text-center"
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
