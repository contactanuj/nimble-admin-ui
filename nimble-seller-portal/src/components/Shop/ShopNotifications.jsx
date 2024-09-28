import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getNotifications, listenForNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, deleteAllNotifications, searchNotifications } from '../../redux/actions/notification';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  IconButton,
  Paper,
  Container,
  Stack,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DashboardHeader from './Layout/DashboardHeader';
import DashboardSideBar from './Layout/DashboardSideBar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#009688', // Teal color
    },
    secondary: {
      main: '#f44336', // Red color for delete actions
    },
  },
});

const ShopNotifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notification);
  const { seller } = useSelector((state) => state.seller);
  const [newNotifications, setNewNotifications] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState('');

  useEffect(() => {
    dispatch(getNotifications(seller._id));
    dispatch(listenForNotifications(seller._id));
  }, [dispatch, seller._id]);

  const allNotifications = [...newNotifications, ...notifications];

  const handleSearch = () => {
    dispatch(searchNotifications(seller._id, { message: searchCriteria }));
  };

  const handleMarkRead = (notificationId) => {
    dispatch(markNotificationRead(seller._id, notificationId));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead(seller._id));
  };

  const handleDeleteById = (notificationId) => {
    dispatch(deleteNotification(seller._id, notificationId));
  };

  const handleDeleteAll = () => {
    dispatch(deleteAllNotifications(seller._id));
  };

  return (
    <div>
        <DashboardHeader />
        <div className="flex justify-between w-full">
            <div className="w-[80px] 800px:w-[330px]">
              <DashboardSideBar active={5} />
            </div>
            <div className="w-full justify-center flex">
              
              <ThemeProvider theme={theme}>
                <Box sx={{ width: { xs: '100%', md: '75%' } }}>
                  <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                    <Button
                      component={Link}
                      to="/dashboard"
                      startIcon={<ArrowBackIcon />}
                      sx={{ mb: 2 }}
                    >
                      Back to Dashboard
                    </Button>
                    <Typography variant="h4" gutterBottom align="center" color="primary">
                      Notifications
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Search notifications..."
                          value={searchCriteria}
                          onChange={(e) => setSearchCriteria(e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={handleSearch}>
                                <SearchIcon />
                              </IconButton>
                            ),
                          }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSearch}
                          startIcon={<SearchIcon />}
                        >
                          Search
                        </Button>
                      </Stack>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={handleMarkAllRead}
                          startIcon={<CheckIcon />}
                        >
                          Mark All Read
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          onClick={handleDeleteAll}
                          startIcon={<DeleteIcon />}
                        >
                          Delete All
                        </Button>
                      </Stack>
                    </Box>
                    <List>
                      {allNotifications.map((notification) => (
                        <Card key={notification._id} sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="body1" component={Link} to={`/order/${notification.orderId}`} color="primary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {new Date(notification.date).toLocaleString()}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <IconButton
                              onClick={() => handleMarkRead(notification._id)}
                              color="primary"
                              aria-label="mark as read"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeleteById(notification._id)}
                              color="secondary"
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      ))}
                    </List>
                    {allNotifications.length === 0 && (
                      <Box textAlign="center" py={4}>
                        <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary" mt={2}>
                          No notifications yet
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </ThemeProvider>
            </div>
          </div>
    </div>
  );
};

export default ShopNotifications;