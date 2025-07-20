// At the top of WebSocketComponent.js
import { useState, useEffect, useCallback } from 'react';
/**
 * @typedef {import("react").ReactNode} ReactNode
 */

/**
 * @callback WebSocketEventHandler
 * @param {Event} event - The WebSocket event object.
 */

/**
 * @callback WebSocketErrorEventHandler
 * @param {Event} error - The WebSocket error event object.
 */

/**
 * @callback RenderPropFunction
 * @param {object} params
 * @param {WebSocket | null} params.socket
 * @param {boolean} params.isConnected
 * @param {() => void} params.connect
 * @param {() => void} params.disconnect
 * @param {(message: string | object) => boolean} params.sendMessage
 * @param {number} params.reconnectAttempts
 * @returns {ReactNode}
 */

/**
 * @param {object} props
 * @param {string} props.url - The WebSocket URL.
 * @param {WebSocketEventHandler} [props.onOpen] - Callback for when the connection opens.
 * @param {WebSocketEventHandler} [props.onMessage] - Callback for when a message is received.
 * @param {WebSocketEventHandler} [props.onClose] - Callback for when the connection closes.
 * @param {WebSocketErrorEventHandler} [props.onError] - Callback for WebSocket errors.
 * @param {RenderPropFunction} props.children - A function that renders the component's children.
 */
const WebSocketComponent = ({
  url,
  onOpen,
  onMessage,
  onClose,
  onError,
  children
}) => {
  /** @type {React.MutableRefObject<WebSocket | null>} */
  // Use a ref if you don't want re-renders when the socket object itself changes,
  // or simply type useState directly if you want state updates to trigger re-renders
  // when the socket instance changes (which you do want here for managing the connection).

  /**
   * @type {React.Dispatch<React.SetStateAction<WebSocket | null>>} setSocket
   * @type {WebSocket | null} socket
   */
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (socket) {
      socket.close();
    }

    const ws = new WebSocket(url);

    ws.onopen = (event) => {
      setIsConnected(true);
      setReconnectAttempts(0);
      ws.send('{"command": "getcommands", "payload": ""}');
      onOpen && onOpen(event);
    };

    ws.onmessage = (event) => {
      onMessage && onMessage(event);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      onClose && onClose(event);

      // Attempt reconnect if this wasn't a manual closure
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      }
    };

    ws.onerror = (error) => {
      onError && onError(error);
    };

    setSocket(ws);
  }, [url, onOpen, onMessage, onClose, onError, reconnectAttempts, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'User initiated disconnect');
    }
  }, [socket]);

  const sendMessage = useCallback((message) => {
    if (socket && isConnected) {
      if (typeof message !== 'string') {
        message = JSON.stringify(message);
      }
      socket.send(message);
      return true;
    }
    return false;
  }, [socket, isConnected]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return children({
    socket,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    reconnectAttempts
  });
};

export default WebSocketComponent;