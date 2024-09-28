import axios from 'axios';
import { server } from '../../server';

// Get notifications
export const getNotifications = (sellerId) => async (dispatch) => {
  try {
    dispatch({ type: 'getNotificationsRequest' });

    const { data } = await axios.get(`${server}/notification/${sellerId}`);

    dispatch({
      type: 'getNotificationsSuccess',
      payload: data.notifications,
    });
  } catch (error) {
    dispatch({
      type: 'getNotificationsFailed',
      payload: error.response.data.message,
    });
  }
};

// Listen for notifications
export const listenForNotifications = (sellerId) => (dispatch) => {
  // Implementation depends on how you handle socket connections
  // This is just a placeholder
  dispatch({ type: 'listenForNotifications', payload: sellerId });
};

// Mark notification as read
export const markNotificationRead = (sellerId, notificationId) => async (dispatch) => {
  try {
    await axios.patch(`${server}/notification/${sellerId}/read/${notificationId}`);

    dispatch({
      type: 'markNotificationRead',
      payload: notificationId,
    });
  } catch (error) {
    console.error(error);
  }
};

// Mark all notifications as read
export const markAllNotificationsRead = (sellerId) => async (dispatch) => {
  try {
    await axios.patch(`${server}/notification/${sellerId}/read-all`);

    dispatch({ type: 'markAllNotificationsRead' });
  } catch (error) {
    console.error(error);
  }
};

// Delete notification
export const deleteNotification = (sellerId, notificationId) => async (dispatch) => {
  try {
    await axios.delete(`${server}/notification/${sellerId}/${notificationId}`);

    dispatch({
      type: 'deleteNotification',
      payload: notificationId,
    });
  } catch (error) {
    console.error(error);
  }
};

// Delete all notifications
export const deleteAllNotifications = (sellerId) => async (dispatch) => {
  try {
    await axios.delete(`${server}/notification/${sellerId}/delete-all`);

    dispatch({ type: 'deleteAllNotifications' });
  } catch (error) {
    console.error(error);
  }
};

// Search notifications
export const searchNotifications = (sellerId, criteria) => async (dispatch) => {
  try {
    const { data } = await axios.post(`${server}/notification/${sellerId}/search`, criteria);

    dispatch({
      type: 'searchNotifications',
      payload: data.notifications,
    });
  } catch (error) {
    console.error(error);
  }
};