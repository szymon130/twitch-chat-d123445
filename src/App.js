import React, { useRef, useEffect, useState } from 'react';
import SuggestionsList from './components/SuggestionsList';
import TerminalLine from './components/TerminalLine';
import WebSocketComponent from './components/WebSocket/WebSocketComponent';
import handleFnCall from './fnHandlers/_index';
import { TerminalProvider } from './context/TerminalContext';
import useTerminalActions from './hooks/useTerminalActions';
import { actions } from './context/TerminalContext';
import NotificationCarousel from './NotificationCarousel'

function TerminalApp() {
  const { state, addMessage, executeCommand, handleInputChange, dispatch, addNotification } =
    useTerminalActions();

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const formRef = useRef(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [state.command]);
  const [initialAutoConnect, setInitialAutoConnect] = useState(false);

  useEffect(() => {
    window.__terminalCommandRef = state.command;
  }, [state.command]);

  // Add character count state
  const [charState, setCharState] = useState({
    current: 0,
    max: 500,
    exceeded: false
  });

  // Add this effect to handle textarea auto-resizing and character counting
  useEffect(() => {
    if (inputRef.current) {
      // Auto-resize
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;

      // Character counting
      const command = state.command;
      let charCount = command.length;

      // Adjust for /say commands
      if (command.startsWith('/say') && state.activeChannel) {
        const prefix = `/say #${state.activeChannel} `;
        if (command.startsWith(prefix)) {
          charCount = command.substring(prefix.length).length;
        }
      }

      setCharState({
        current: charCount,
        max: 500,
        exceeded: charCount > 500
      });
    }
  }, [state.command, state.activeChannel]);

  // Create a ref for the latest state
  const stateRef = useRef(state);
  stateRef.current = state; // Update ref on every render

  // Check for channel query parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const channel = urlParams.get('channel');
    if (channel) {
      dispatch({ type: actions.SET_ACTIVE_CHANNEL, payload: channel });
      setInitialAutoConnect(true); // Set flag for auto-connect
    }
  }, [dispatch]);

  // Scroll to bottom when lines change
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.lines]);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClick = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });
      }
      inputRef.current?.focus();
    };

    const terminalWindow = document.getElementById('terminal-window');
    terminalWindow?.addEventListener('click', handleClick);
    return () => terminalWindow?.removeEventListener('click', handleClick);
  }, [dispatch]);

  const handleKeyDown = (e) => {
    if (state.showSuggestions && state.suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch({
          type: actions.SET_ACTIVE_SUGGESTION,
          payload: (state.activeSuggestionIndex + 1) % state.suggestions.length
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        dispatch({
          type: actions.SET_ACTIVE_SUGGESTION,
          payload: (state.activeSuggestionIndex - 1 + state.suggestions.length) %
            state.suggestions.length
        });
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        const parts = state.command.split(' ');
        parts[parts.length - 1] = state.suggestions[state.activeSuggestionIndex].cmd;
        dispatch({ type: actions.SET_COMMAND, payload: parts.join(' ') + ' ' });
        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });
      }
    } else {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.historyIndex < state.commandHistory.length - 1) {
          const newIndex = state.historyIndex + 1;
          dispatch({ type: actions.SET_HISTORY_INDEX, payload: newIndex });
          dispatch({ type: actions.SET_COMMAND, payload: state.commandHistory[newIndex] });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          dispatch({ type: actions.SET_HISTORY_INDEX, payload: newIndex });
          dispatch({ type: actions.SET_COMMAND, payload: state.commandHistory[newIndex] });
        } else {
          dispatch({ type: actions.SET_HISTORY_INDEX, payload: -1 });
          dispatch({ type: actions.SET_COMMAND, payload: '' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const submitButton = document.getElementById('submit-button');
        if (submitButton) submitButton.click();
      }
    }
  };

  const removeNotification = (id) => {
    dispatch({ type: actions.REMOVE_NOTIFICATION, payload: id });
  };

  return (
    <WebSocketComponent
      url="ws://localhost:5000/ws"
      autoConnect={initialAutoConnect} // Pass auto-connect flag
      onOpen={(event) => {
        addMessage('success', 'WebSocket connection established');
        dispatch({
          type: actions.SET_AVAILABLE_COMMANDS,
          payload: {
            ...state.availableCommands,
            '/clear-saved': {
              description: 'Clears saved chat messages',
              params: []
            },
          }
        });
      }}
      onMessage={(event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'fncall' && msg.function) {
            const wasHandled = handleFnCall(
              msg.function,
              msg.data,
              {
                addMessage,
                dispatch,
                state: stateRef.current,
                addNotification // Add this to pass to handlers
              }
            );

            if (!wasHandled) {
              addMessage('warning', `No handler for function: ${msg.function}`);
            }
          } else {
            addMessage(msg.type, `SERVER -> CLIENT: ${JSON.stringify(msg)}`);
          }
        } catch (err) {
          addMessage('error', `Received malformed message: ${event.data}`);
        }
      }}
      onClose={(event) => {
        addMessage('system', `WebSocket connection closed: ${event.reason || 'Unknown reason'}`);
        const { disconnect, ping, echo, login, ...rest } = state.availableCommands;
        dispatch({ type: actions.SET_AVAILABLE_COMMANDS, payload: rest });
      }}
      onError={(error) => {
        addMessage('error', `WebSocket error: ${error.message}`);
      }}
    >
      {(wsMethods) => (
        <div className="text-white h-screen w-screen flex flex-col font-sans p-0 sm:p-4" style={{ backgroundColor: "#1f1f23" }}>
          <NotificationCarousel
            notifications={state.notifications}
            removeNotification={removeNotification}
          />
          <div className="bg-black bg-opacity-50 rounded-lg shadow-2xl flex flex-col flex-grow h-full overflow-hidden">
            {/* Header */}
            <div className="p-3 flex items-center border-b border-gray-700" style={{ backgroundColor: "#101011ff" }}>
              <div className="flex space-x-2">
                {/* <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div> */}
              </div>
              <div className="flex-grow text-center text-sm font-bold" style={{ color: 'var(--twitch-purple)' }}>
                Twitch Multi Chat
              </div>
              <div className={`w-3 h-3 rounded-full transition-colors ${wsMethods.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                title={wsMethods.isConnected ? 'Connected' : 'Disconnected'}></div>
            </div>

            {/* Output */}
            <div id="terminal-window" className="flex-grow overflow-y-auto" style={{ overflowX: 'hidden' }}>
              {state.lines.map((line, index) => (
                <TerminalLine key={index} type={line.type} content={line.content} index={index} />
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Input */}
            <div ref={formRef} className="relative p-2 border-t border-gray-700">
              {state.showSuggestions && state.suggestions.length > 0 && (
                <SuggestionsList
                  suggestions={state.suggestions}
                  activeSuggestionIndex={state.activeSuggestionIndex}
                  onSelect={(suggestion) => {
                    const parts = state.command.split(' ');
                    parts[parts.length - 1] = suggestion;
                    dispatch({ type: actions.SET_COMMAND, payload: parts.join(' ') + ' ' });
                    dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });
                  }}
                />
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeCommand(state.command, wsMethods);
                }}
                className="flex items-center font-mono text-sm"
                id="input-form"
              >
                <span className="text-cyan-400 mr-2" style={{ height: '24px' }}>$</span>
                <div className="relative w-full">
                  <textarea
                    id="input-form-input"
                    ref={inputRef}
                    value={state.command}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`bg-transparent border-none text-white w-full focus:outline-none resize-none overflow-hidden ${charState.exceeded ? 'text-red-500' : ''
                      }`}
                    rows={1}
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                    placeholder={state.activeChannel ? `Active channel: ${state.activeChannel}` : ''}
                  />
                  {charState.exceeded && (
                    <div className="absolute right-0 bottom-full text-red-500 text-xs mb-1 bg-black bg-opacity-75 px-2 py-1 rounded">
                      {charState.current}/{charState.max} characters
                    </div>
                  )}
                </div>
                <button type='submit' id='submit-button'>Send</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </WebSocketComponent>
  );
}

export default function App() {
  return (
    <TerminalProvider>
      <TerminalApp />
    </TerminalProvider>
  );
}