import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null); // Manage socket state

    useEffect(() => {
        const newSocket = io('http://localhost:8000'); // Initialize socket connection
        setSocket(newSocket); // Set socket instance

        // Listen for notifications globally
        newSocket.on('notification', (notification) => {
            toast.info(`New notification: ${notification.message}`);
        });

        // Clean up on component unmount
        return () => {
            newSocket.off('notification');
            newSocket.close(); // Close socket connection on cleanup
        };
    }, []); // Run once on mount

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
