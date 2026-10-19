import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    socketRef.current = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, [isAuthenticated, token]);

  const subscribe = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => socketRef.current?.off(event, callback);
    }
    return () => {};
  }, []);

  const joinOrder = useCallback((orderId) => {
    socketRef.current?.emit('join_order', orderId);
  }, []);

  const leaveOrder = useCallback((orderId) => {
    socketRef.current?.emit('leave_order', orderId);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, subscribe, joinOrder, leaveOrder }}>
      {children}
    </SocketContext.Provider>
  );
};
