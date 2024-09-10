import React, { useState } from 'react';

const OrderStatusButton = ({ data, updateStatus }) => {
  const [status, setStatus] = useState(data?.status || "");

  const statuses = [
    "Processing",
    "Transferred to delivery partner",
    "Shipping",
    "Received",
    "On the way",
    "Delivered",
  ];

  // Find the index of the current status
  const currentStatusIndex = statuses.indexOf(status);

  // Determine the next status option
  const nextStatus = statuses[currentStatusIndex + 1];

  // Button click handler
  const handleStatusUpdate = () => {
    if (nextStatus) {
      setStatus(nextStatus);
      updateStatus(nextStatus); // Call the parent function to update the status
    }
  };

  return (
    <div>
      <h4 className="pt-3 text-[20px] font-[600]">Order Status:</h4>
      <p className="mt-2 text-gray-700">Current Status: {status}</p>
      {nextStatus ? (
        <button
          onClick={handleStatusUpdate}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Move to Next Status: {nextStatus}
        </button>
      ) : (
        <p className="mt-2 text-gray-500">No further status options available</p>
      )}
    </div>
  );
};

export default OrderStatusButton;
