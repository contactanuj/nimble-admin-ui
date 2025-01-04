import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Filter, Search, X } from "lucide-react";
import debounce from 'lodash/debounce';
import { getAllOrdersOfShop } from '../../redux/actions/order';

const OrderItemsTooltip = ({ items }) => (
  <div className="bg-white shadow-lg rounded-lg p-4 min-w-[200px] border">
    <table className="w-full">
      <tbody>
        {items.map((item, index) => (
          <tr key={index} className="border-b last:border-b-0">
            <td className="py-2">{item.name}</td>
            <td className="text-right py-2">{item.qty} x ${item.discountPrice}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });
};

// Filter component for individual columns
const ColumnFilter = ({ column, table }) => {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === "number" ? (
    <div className="flex space-x-2">
      <input
        type="number"
        value={(columnFilterValue)?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old) => [e.target.value, old?.[1]])
        }
        placeholder="Min"
        className="w-24 border rounded px-2 py-1"
      />
      <input
        type="number"
        value={(columnFilterValue)?.[1] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old) => [old?.[0], e.target.value])
        }
        placeholder="Max"
        className="w-24 border rounded px-2 py-1"
      />
    </div>
  ) : (
    <input
      type="text"
      value={(columnFilterValue ?? "")}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={`Filter ${column.id}...`}
      className="w-36 border rounded px-2 py-1"
    />
  );
};

const AllOrders = ({ showSearchBox = true }) => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch, seller._id]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const columns = useMemo(
    () => [
      {
        header: 'Order ID',
        accessorKey: '_id',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'User',
        accessorKey: 'user.name',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Collection Time',
        accessorKey: 'selectedCollectionTime',
        cell: ({ getValue }) => formatDate(getValue()),
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Items',
        accessorKey: 'cart',
        cell: ({ row, getValue }) => (
          <div className="relative">
            {hoveredRow === row.original._id ? (
              <div className="absolute z-50 top-full left-0">
                <OrderItemsTooltip items={getValue()} />
              </div>
            ) : getValue().length}
          </div>
        ),
        enableSorting: true,
        sortingFn: (rowA, rowB) => rowA.original.cart.length - rowB.original.cart.length,
      },
      {
        header: 'Total',
        accessorKey: 'totalPrice',
        cell: ({ getValue }) => `US$ ${getValue()}`,
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: '',
        accessorKey: '_id',
        cell: ({ getValue }) => (
          <Link to={`/order/${getValue()}`}>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        ),
        enableSorting: true,
        enableColumnFilter: true,
      },
    ],
    [hoveredRow]
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    manualPagination: false,

  });

  const debouncedSearch = debounce((value) => {
    setGlobalFilter(value);
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Orders</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showSearchBox && (
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search all columns..."
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}

        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Column Filters</h3>
            <div className="flex flex-wrap gap-4">
              {table.getAllColumns()
                .filter(column => column.getCanFilter())
                .map(column => (
                  <div key={column.id} className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">
                      {column.columnDef.header}
                    </label>
                    <ColumnFilter column={column} table={table} />
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b bg-gray-50">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          
                          {header.column.getCanSort() && (
                            <span className="flex items-center">
                              {{
                                asc: <ArrowUp className="h-4 w-4" />,
                                desc: <ArrowDown className="h-4 w-4" />,
                              }[header.column.getIsSorted()] ?? (
                                <ArrowUpDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                  onMouseEnter={() => setHoveredRow(row.original._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {'<<'}
            </button>
            <button
              className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {'<'}
            </button>
            <button
              className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {'>'}
            </button>
            <button
              className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {'>>'}
            </button>
          </div>
          
          <span className="flex items-center gap-1 text-sm">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              const value = e.target.value === 'all' ? orders.length : Number(e.target.value);
              table.setPageSize(value);
            }}
            className="px-2 py-1 rounded border"
          >
            {[10, 20, 30, 40, 50, 'all'].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize === 'all' ? 'All' : pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AllOrders;