import { createReducer } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  isLoading: false,
  error: null,
};

const notificationReducer = createReducer(initialState, (builder) => {
  builder
    .addCase('getNotificationsRequest', (state) => {
      state.isLoading = true;
    })
    .addCase('getNotificationsSuccess', (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
    })
    .addCase('getNotificationsFailed', (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase('markNotificationRead', (state, action) => {
      state.notifications = state.notifications.map((notification) =>
        notification._id === action.payload ? { ...notification, read: true } : notification
      );
    })
    .addCase('markAllNotificationsRead', (state) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
    })
    .addCase('deleteNotification', (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification._id !== action.payload
      );
    })
    .addCase('deleteAllNotifications', (state) => {
      state.notifications = [];
    })
    .addCase('searchNotifications', (state, action) => {
      state.notifications = action.payload;
    })
    .addCase('clearErrors', (state) => {
      state.error = null;
    });
});

export default notificationReducer;