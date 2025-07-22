// src/App.js

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import SuggestionsList from './components/SuggestionsList';
import TerminalLine from './components/TerminalLine';
import WebSocketComponent from './components/WebSocket/WebSocketComponent';
import handleFnCall from './fnHandlers/_index';
import { TerminalProvider } from './context/TerminalContext';
import useTerminalActions from './hooks/useTerminalActions';
import { actions } from './context/TerminalContext';
// import NotificationCarousel from './NotificationCarousel'; // Removed import

const INITIAL_DISPLAY_MESSAGES = 30; // Number of messages to display initially
const SCROLL_TOLERANCE = 20; // Tolerance in pixels for considering the scroll at the bottom

function TerminalApp() {
  // stateRef must be defined before useTerminalActions call if passed
  const stateRef = useRef(null); // Initialize ref

  // Destructure addMessage directly from useTerminalActions hook, passing stateRef
  const { state, addMessage, executeCommand, handleInputChange, dispatch } = // Removed addNotification
    useTerminalActions(stateRef);

  // Update ref on every render for latest state snapshot, AFTER 'state' is initialized
  stateRef.current = state;

  const terminalEndRef = useRef(null);
  const terminalWindowRef = useRef(null); // Ref for the scrollable terminal window
  const inputRef = useRef(null);
  const formRef = useRef(null);

  // Character count state
  const [charState, setCharState] = useState({
    current: 0,
    max: 500,
    exceeded: false
  });

  const [initialAutoConnect, setInitialAutoConnect] = useState(false);
  // New state for "Load More" button visibility and count
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [messagesToLoadCount, setMessagesToLoadCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // New state for loading animation

  // States for reply functionality
  const [isSelectingReply, setIsSelectingReply] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(-1);
  const [replyingToMessageId, setReplyingToMessageId] = useState(null); // Store ID of message being replied to

  useEffect(() => {
    window.__terminalCommandRef = state.command;
  }, [state.command]);

  // Handle textarea auto-resizing and character counting
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;

      const command = state.command;
      let charCount = command.length;

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

  // Check for channel query parameter on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const channel = urlParams.get('channel');
    if (channel) {
      dispatch({ type: actions.SET_ACTIVE_CHANNEL, payload: channel });
      setInitialAutoConnect(true);
    }
  }, [dispatch]);

  // Scroll to bottom when displayedLines changes AND when isScrolledToBottom is true
  useEffect(() => {
    if (state.isScrolledToBottom) {
      if (terminalWindowRef.current) {
        terminalWindowRef.current.scrollTop = terminalWindowRef.current.scrollHeight;
      }
    }
  }, [state.displayedLines, state.isScrolledToBottom]);

  // Handle click outside suggestions
  useEffect(() => {
    const handleClick = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });
        // Also clear reply selection if clicking outside
        setIsSelectingReply(false);
        setSelectedMessageIndex(-1);
        setReplyingToMessageId(null); // Clear accepted reply highlight
      }
      inputRef.current?.focus();
    };

    const terminalWindow = document.getElementById('terminal-window');
    terminalWindow?.addEventListener('click', handleClick);
    return () => terminalWindow?.removeEventListener('click', handleClick);
  }, [dispatch]);

  const handleKeyDown = (e) => {
    // If suggestions are shown, prioritize them
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
      // Handle reply selection with Shift + Arrows
      if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault(); // Prevent actual scrolling of the terminal window
        setIsSelectingReply(true);
        setReplyingToMessageId(null); // Clear accepted reply highlight when selecting again
        const maxIndex = state.displayedLines.length - 1;
        let newIndex = selectedMessageIndex;

        if (selectedMessageIndex === -1) { // If no message is selected yet, start from the last message
          newIndex = maxIndex;
        } else if (e.key === 'ArrowUp') {
          newIndex = Math.max(0, selectedMessageIndex - 1);
        } else if (e.key === 'ArrowDown') {
          newIndex = Math.min(maxIndex, selectedMessageIndex + 1);
        }

        // Only allow selection of 'user_message_data' types for reply
        let validIndexFound = false;
        let originalNewIndex = newIndex; // Store original calculated index

        // Search for the nearest valid message
        if (e.key === 'ArrowUp') {
          for (let i = originalNewIndex; i >= 0; i--) {
            if (state.displayedLines[i]?.rehydrateType === 'user_message_data') {
              newIndex = i;
              validIndexFound = true;
              break;
            }
          }
        } else { // ArrowDown or initial selection
          for (let i = originalNewIndex; i <= maxIndex; i++) {
            if (state.displayedLines[i]?.rehydrateType === 'user_message_data') {
              newIndex = i;
              validIndexFound = true;
              break;
            }
          }
        }

        if (validIndexFound) {
          setSelectedMessageIndex(newIndex);
        } else {
          // If no valid message found, reset selection
          setIsSelectingReply(false);
          setSelectedMessageIndex(-1);
        }

      } else if (isSelectingReply && (e.key === 'Enter' || e.key === 'Tab')) {
        e.preventDefault();
        if (selectedMessageIndex !== -1) {
          const selectedLine = state.displayedLines[selectedMessageIndex];
          if (selectedLine?.rehydrateType === 'user_message_data') {
            const { user, channel, tags } = selectedLine.rehydrateData;
            const username = tags['display-name'] || user;
            const messageId = tags.id;

            // Pre-fill the command line with /say #channel @username
            // Message ID is NOT placed in the textarea, but saved in state
            dispatch({
              type: actions.SET_COMMAND,
              payload: `/say #${channel} @${username} `
            });
            setReplyingToMessageId(messageId); // Save message ID for sending
          }
        }
        setIsSelectingReply(false); // Exit reply selection mode
        setSelectedMessageIndex(-1);
      } else if (isSelectingReply && e.key === 'Escape') {
        e.preventDefault();
        setIsSelectingReply(false); // Cancel reply selection
        setSelectedMessageIndex(-1);
        setReplyingToMessageId(null); // Clear accepted reply highlight
      } else {
        // Normal command history navigation
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
    }
  };


  const removeNotification = useCallback((id) => {
    // dispatch({ type: actions.REMOVE_NOTIFICATION, payload: id }); // Removed
  }, []); // Removed dispatch from dependencies, as it's not used here anymore

  const handleLoadMoreClick = useCallback(() => {
    setIsLoadingMore(true); // Start loading animation
    const terminalWindow = terminalWindowRef.current;
    if (terminalWindow && state.displayedLines.length < state.lines.length) {
      const currentDisplayedCount = state.displayedLines.length;
      const remainingHistoryCount = state.lines.length - currentDisplayedCount;
      const messagesToLoad = Math.min(INITIAL_DISPLAY_MESSAGES, remainingHistoryCount);

      if (messagesToLoad > 0) {
        const startIndex = state.lines.length - currentDisplayedCount - messagesToLoad;
        const newMessages = state.lines.slice(startIndex, startIndex + messagesToLoad);
        dispatch({ type: actions.PREPEND_LINES, payload: newMessages });

        // Maintain scroll position
        const oldScrollHeight = terminalWindow.scrollHeight;
        requestAnimationFrame(() => {
          if (terminalWindowRef.current) {
            terminalWindowRef.current.scrollTop = terminalWindowRef.current.scrollHeight - oldScrollHeight;
          }
          setIsLoadingMore(false); // End loading animation after scroll adjustment
        });
      } else {
        setIsLoadingMore(false); // End loading if no messages to load
      }
    } else {
      setIsLoadingMore(false); // End loading if no messages to load
    }
    setShowLoadMore(false); // Hide the button after loading
  }, [state.displayedLines, state.lines, dispatch]);

  const handleScroll = useCallback(

    debounce(() => {
      const terminalWindow = terminalWindowRef.current;
      if (terminalWindow) {
        const { scrollTop, scrollHeight, clientHeight } = terminalWindow;
        // Use SCROLL_TOLERANCE here
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + SCROLL_TOLERANCE;

        if (isAtBottom !== stateRef.current.isScrolledToBottom) {
          dispatch({ type: actions.SET_SCROLLED_TO_BOTTOM, payload: isAtBottom });
        }

        // If scrolled to bottom and there are buffered messages, display them
        if (isAtBottom && stateRef.current.bufferedLines.length > 0) {
          dispatch({
            type: actions.SET_DISPLAYED_LINES,
            payload: [...stateRef.current.displayedLines, ...stateRef.current.bufferedLines]
          });
          dispatch({ type: actions.CLEAR_BUFFERED_LINES });
        }

        // Show "Load More" button if scrolled to top and there's more history
        if (scrollTop === 0 && state.displayedLines.length < state.lines.length) {
          const remainingHistoryCount = state.lines.length - state.displayedLines.length;
          setMessagesToLoadCount(Math.min(INITIAL_DISPLAY_MESSAGES, remainingHistoryCount));
          setShowLoadMore(true);
        } else {
          setShowLoadMore(false);
        }
      }
    }, 200), [state.displayedLines, state.lines, dispatch]);

  // Override executeCommand from useTerminalActions to append message ID
  const customExecuteCommand = useCallback((command, wsMethods) => {
    let finalPayload = command;
    let cmd = command.split(' ')[0];

    if (cmd === '/say' && replyingToMessageId) {
      // Append the message ID to the payload for the backend
      finalPayload = `${command}\n\n;${replyingToMessageId}`;
      setReplyingToMessageId(null); // Clear the reply ID after it's used
    }
    // Corrected: Pass finalPayload as the command to the original executeCommand
    executeCommand(finalPayload, wsMethods); // Call the original executeCommand with the modified command/payload
  }, [executeCommand, replyingToMessageId]);


  return (
    <WebSocketComponent
      url="ws://localhost:5000/ws"
      autoConnect={initialAutoConnect}
      onOpen={(event) => {
        // Use the addMessage function from the hook
        addMessage('success', 'WebSocket connection established');
        dispatch({
          type: actions.SET_AVAILABLE_COMMANDS,
          payload: {
            ...state.availableCommands
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
                addMessage: addMessage, // Use the addMessage from the hook
                dispatch,
                state: stateRef.current,
                // addNotification // Removed
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
          {/* <NotificationCarousel // Removed
            notifications={state.notifications}
            removeNotification={removeNotification}
          /> */}
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
            <div
              id="terminal-window"
              ref={terminalWindowRef}
              className={`flex-grow overflow-y-auto ${!state.isScrolledToBottom ? 'auto-scroll-disabled' : ''}`}
              style={{ overflowX: 'hidden' }}
              onScroll={handleScroll}
            >
              {showLoadMore && messagesToLoadCount > 0 && (
                <div className="text-center py-2">
                  <button
                    onClick={handleLoadMoreClick}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs"
                  >
                    Load {messagesToLoadCount} more messages
                  </button>
                </div>
              )}
              {isLoadingMore && (
                <div className="text-center text-gray-400 py-2 text-sm">Loading...</div>
              )}
              {state.displayedLines.map((line, index) => (
                <TerminalLine
                  key={index}
                  type={line.type}
                  content={line.content}
                  index={index}
                  rehydrateType={line.rehydrateType} // Pass rehydrateType
                  rehydrateData={line.rehydrateData} // Pass rehydrateData
                  dispatch={dispatch} // Pass dispatch
                  state={state} // Pass state
                  isBufferedNew={line.isBufferedNew} // Pass isBufferedNew
                  isSelected={isSelectingReply && selectedMessageIndex === index} // Pass isSelected prop for dotted border
                  isReplyingAccepted={replyingToMessageId === line.rehydrateData?.tags?.id} // Pass for yellowish background
                />
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
                  customExecuteCommand(state.command, wsMethods); // Use customExecuteCommand
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