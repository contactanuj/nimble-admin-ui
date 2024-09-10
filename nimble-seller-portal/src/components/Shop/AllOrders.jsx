import { DataGrid } from "@mui/x-data-grid";
import { Button, Tooltip, Table, TableBody, TableCell, TableRow, TableContainer, Paper } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight } from "react-icons/ai";

const OrderItemsTooltip = ({ items }) => (
  <TableContainer component={Paper}>
    <Table size="small" aria-label="order items">
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.name}</TableCell>
            <TableCell align="right">{item.qty} x ${item.discountPrice}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Helper function to format date
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

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch, seller._id]);

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },
    { field: "user", headerName: "User", minWidth: 150, flex: 0.7 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      flex: 0.7,
    },
    {
      field: "collectionTime",
      headerName: "Collection Time",
      minWidth: 150,
      flex: 0.7,
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => (
        <Tooltip
          title={<OrderItemsTooltip items={params.row.items} />}
          arrow
          placement="top-start"
        >
          <Button>{params.value}</Button>
        </Tooltip>
      ),
    },
    {
      field: "total",
      headerName: "Total",
      type: "number",
      minWidth: 150,
      flex: 0.8,
    },
    {
      field: " ",
      flex: 1,
      minWidth: 150,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/order/${params.id}`}>
              <Button>
                <AiOutlineArrowRight size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },
  ];

  const row = orders?.map((item) => ({
    id: item._id,
    user: item.user?.name,
    itemsQty: item.cart.length,
    total: "US$ " + item.totalPrice,
    status: item.status,
    collectionTime: formatDate(item.selectedCollectionTime),
    items: item.cart,
  }));

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      )}
    </>
  );
};

export default AllOrders;
