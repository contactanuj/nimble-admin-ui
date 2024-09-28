import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button, Tooltip, Table, TableBody, TableCell, TableRow, TableContainer,
  Paper, TextField, InputAdornment, IconButton, Typography, Box
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AiOutlineArrowRight } from "react-icons/ai";
import ClearIcon from '@mui/icons-material/Clear';
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { server } from "../../server";
import axios from "axios";
import debounce from 'lodash/debounce';

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

const AllOrders = (props) => {
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

  // Debounce search to prevent clearing on typing
  const debouncedSearch = debounce(async () => {
    if (!searchQuery.trim()) {
      setFilteredOrders([]);
      return;
    }

    setIsSearching(true);

    try {
      const { data } = await axios.get(
        `${server}/order/search-orders`,
        {
          params: { query: searchQuery },
          withCredentials: true
        }
      );

      if (data.success) {
        setFilteredOrders(data.orders.length === 0 ? [] : data.orders);
      } else {
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while searching for orders");
      setFilteredOrders([]);
    } finally {
      setIsSearching(false);
    }
  }, 500); // Adjust the delay for debounce (500ms in this case)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredOrders([]);
  };

  const displayedOrders = searchQuery && filteredOrders.length > 0 ? filteredOrders : orders;

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 170, flex: 0.8 },
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
      minWidth: 250,
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
          <Link to={`/order/${params.id}`}>
            <Button>
              <AiOutlineArrowRight size={20} />
            </Button>
          </Link>
        );
      },
    },
  ];

  const rows = displayedOrders?.map((item) => ({
    id: item._id,
    user: item.user?.name,
    itemsQty: item.cart.length,
    total: "US$ " + item.totalPrice,
    status: item.status,
    collectionTime: formatDate(item.selectedCollectionTime),
    items: item.cart,
  }));

  const MobileOrderCard = ({ order }) => (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="subtitle1">Order ID: {order.id}</Typography>
      <Typography>User: {order.user}</Typography>
      <Typography>Status: {order.status}</Typography>
      <Typography>Collection Time: {order.collectionTime}</Typography>
      <Typography>Items Qty: {order.itemsQty}</Typography>
      <Typography>Total: {order.total}</Typography>
      <Button component={Link} to={`/order/${order.id}`} sx={{ mt: 1 }}>
        View Details <AiOutlineArrowRight size={20} />
      </Button>
    </Box>
  );

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 }, mt: 2, bgcolor: 'background.paper' }}>
          {props.showSearchBox !== false && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
            <TextField
              label="Search Orders"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={debouncedSearch}
              sx={{ height: { sm: '56px' }, minWidth: { sm: '120px' } }}
            >
              Search
            </Button>
          </Box>)}

          {isMobile ? (
            <Box>
              {rows.map((row) => (
                <MobileOrderCard key={row.id} order={row} />
              ))}
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              disableSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': {
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                },
              }}
            />
          )}
        </Box>
      )}
    </>
  );
};

export default AllOrders;
