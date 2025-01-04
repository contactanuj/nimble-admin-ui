import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { 
  Pencil,
  Trash2,
  Search, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter
} from "lucide-react";
import debounce from 'lodash/debounce';
import { getAllProductsShop, deleteProduct } from "../../redux/actions/product";

// Column filter component
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

const AllProducts = () => {
  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getAllProductsShop(seller._id));
  }, [dispatch, seller._id]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
      window.location.reload();
    }
  };

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Product ID',
        accessorKey: 'productId',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Name',
        accessorKey: 'name',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Price',
        accessorKey: 'price',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Stock',
        accessorKey: 'Stock',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Sold',
        accessorKey: 'sold',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link 
              to={`/dashboard-update-product/${row.original.id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <Pencil className="h-5 w-5" />
            </Link>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const data = useMemo(() => {
    return products?.map((item) => ({
      id: item._id,
      productId: item.productId,
      name: item.name,
      price: "CAD$ " + item.discountPrice,
      Stock: item.stock,
      sold: item?.sold_out,
    })) || [];
  }, [products]);

  const table = useReactTable({
    data,
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
  });

  const debouncedSearch = debounce((value) => {
    setGlobalFilter(value);
  }, 300);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm mx-8 pt-1 mt-10">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Products</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Column Filters</h3>
            <div className="flex flex-wrap gap-4">
              {table.getAllColumns()
                .filter(column => column.getCanFilter())
                .map(column => (
                  <div key={column.id} className="flex flex-col">
                    <label className="text-sm text-gray-600 mb-1">
                      {typeof column.columnDef.header === 'string' 
                        ? column.columnDef.header 
                        : column.id}
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
              table.setPageSize(Number(e.target.value));
            }}
            className="px-2 py-1 rounded border"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;