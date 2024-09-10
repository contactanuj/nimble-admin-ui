import React, { useState } from "react";
import { Modal, Button, TextField, Typography, Box } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { server } from "../../server";

const VerificationModal = ({ open, onClose, onVerify, orderId }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(""); // State to manage error messages

  const handleVerify = async () => {
    try {
      setError(""); // Reset error message
      const response = await axios.post(
        `${server}/order/verify-order/${orderId}`,
        { code },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Order verified successfully!");
        onVerify(); // Callback to update the status
        onClose(); // Close the modal after successful verification
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while verifying the order. Please try again.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="verification-modal-title" aria-describedby="verification-modal-description">
      <Box sx={{ ...modalStyle }}>
        <Typography id="verification-modal-title" variant="h6" component="h2">
          Enter Verification Code
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={!!error}
          helperText={error}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleVerify} variant="contained" color="primary">
            Verify
          </Button>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Define styles for the modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default VerificationModal;
