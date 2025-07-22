// src/context/TerminalContext.js

import React, { createContext, useReducer, useContext } from 'react';

const MAX_MESSAGES_IN_LOCAL_STORAGE = 500;
const INITIAL_DISPLAY_MESSAGES = 30;

const loadLinesFromLocalStorage = () => {
    try {
        const serializedLines = localStorage.getItem('terminalLines');
        if (serializedLines === null) {
            return [{ type: 'system', content: 'Terminal initialized. Type "/help" for a list of commands.' }];
        }
        return JSON.parse(serializedLines);
    } catch (error) {
        console.error("Error loading from local storage:", error);
        return [{ type: 'system', content: 'Terminal initialized. Type "/help" for a list of commands.' }];
    }
};

const saveLinesToLocalStorage = (lines) => {
    try {
        const linesToSave = lines.slice(Math.max(lines.length - MAX_MESSAGES_IN_LOCAL_STORAGE, 0));
        const serializableLines = linesToSave.map(line => {
            // If rehydrateType exists, we assume rehydrateData is serializable JSON
            if (line.rehydrateType) {
                return line;
            } else {
                // For other content (simple strings, or JSX/functions without rehydrateType),
                // convert to a simple string placeholder for storage.
                let serializableContent = line.content;
                if (typeof line.content === 'function') {
                    serializableContent = `[Dynamic Output]`; // Placeholder for functions
                } else if (React.isValidElement(line.content)) {
                    serializableContent = `[Component Output]`; // Placeholder for JSX elements
                }
                return {
                    type: line.type,
                    content: serializableContent
                };
            }
        });
        const serializedLines = JSON.stringify(serializableLines);
        localStorage.setItem('terminalLines', serializedLines);
    } catch (error) {
        console.error("Error saving to local storage:", error);
    }
};

const initialFullLines = loadLinesFromLocalStorage();

const initialState = {
    notifications: [],
    lines: initialFullLines, // Full history of lines up to MAX_MESSAGES_IN_LOCAL_STORAGE
    displayedLines: initialFullLines.slice(Math.max(initialFullLines.length - INITIAL_DISPLAY_MESSAGES, 0)), // Only show last 30 initially
    bufferedLines: [], // New messages buffered when not scrolled to bottom
    isScrolledToBottom: true, // Track if user is at the bottom of the scroll
    command: '',
    commandHistory: [],
    historyIndex: -1,
    availableCommands: {
        '/debug': { description: 'Shows state Object.', params: [] },
        '/help': { description: 'Shows this help message.', params: [] },
        '/clear': { description: 'Clears the terminal screen.', params: [] },
        '/connect': { description: 'Connects to the mock server.', params: [] },
        '/status': { description: 'Checks the connection status.', params: [] },
        '/refresh': { description: 'Press da F5!', params: [] },
    },
    suggestions: [],
    activeSuggestionIndex: 0,
    showSuggestions: false,
    availableCommandsChannel: {},
    userDataByChannel: {},
    activeChannel: null,
    autoConnect: false,
    availableEmotes: {
        global: []
    }
};

export const actions = {
    ADD_LINE: 'ADD_LINE',
    SET_COMMAND: 'SET_COMMAND',
    ADD_TO_HISTORY: 'ADD_TO_HISTORY',
    SET_HISTORY_INDEX: 'SET_HISTORY_INDEX',
    SET_AVAILABLE_COMMANDS: 'SET_AVAILABLE_COMMANDS',
    SET_SUGGESTIONS: 'SET_SUGGESTIONS',
    SET_ACTIVE_SUGGESTION: 'SET_ACTIVE_SUGGESTION',
    SET_SHOW_SUGGESTIONS: 'SET_SHOW_SUGGESTIONS',
    CLEAR_LINES: 'CLEAR_LINES',
    SET_AVAILABLE_COMMANDS_CHANNEL: 'SET_AVAILABLE_COMMANDS_CHANNEL',
    DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL: 'DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL',
    SET_ACTIVE_CHANNEL: 'SET_ACTIVE_CHANNEL',
    SET_AVAILABLE_EMOTES: 'SET_AVAILABLE_EMOTES',
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    SET_USER_DATA: 'SET_USER_DATA',
    DELETE_USER_DATA: 'DELETE_USER_DATA',
    SET_SCROLLED_TO_BOTTOM: 'SET_SCROLLED_TO_BOTTOM',
    SET_DISPLAYED_LINES: 'SET_DISPLAYED_LINES',
    ADD_BUFFERED_LINE: 'ADD_BUFFERED_LINE',
    CLEAR_BUFFERED_LINES: 'CLEAR_BUFFERED_LINES',
    PREPEND_LINES: 'PREPEND_LINES',
};

/**
 * @typedef {{ type: string, content: string | JSX.Element | function, rehydrateType?: string, rehydrateData?: any }} TerminalLine
 */

/**
 * @param {TerminalState} state
 * @param {{ type: string, payload: TerminalLine }} action
 * @returns {TerminalState}
 */
function reducer(state, action) {
    switch (action.type) {
        case 'ADD_LINE': {
            const newLines = [...state.lines, action.payload];
            saveLinesToLocalStorage(newLines);
            return { ...state, lines: newLines };
        }
        case 'SET_COMMAND':
            return { ...state, command: action.payload };
        case 'ADD_TO_HISTORY':
            return {
                ...state,
                commandHistory: [action.payload, ...state.commandHistory],
                historyIndex: -1
            };
        case 'SET_HISTORY_INDEX':
            return { ...state, historyIndex: action.payload };
        case 'SET_AVAILABLE_COMMANDS':
            return { ...state, availableCommands: action.payload };
        case 'SET_SUGGESTIONS':
            return { ...state, suggestions: action.payload };
        case 'SET_ACTIVE_SUGGESTION':
            return { ...state, activeSuggestionIndex: action.payload };
        case 'SET_SHOW_SUGGESTIONS':
            return { ...state, showSuggestions: action.payload };
        case 'CLEAR_LINES':
            saveLinesToLocalStorage([]);
            return { ...state, lines: [], displayedLines: [], bufferedLines: [] };
        case 'SET_AVAILABLE_COMMANDS_CHANNEL':
            return {
                ...state,
                availableCommandsChannel: {
                    ...state.availableCommandsChannel,
                    ...action.payload
                }
            };
        case 'SET_ACTIVE_CHANNEL':
            return { ...state, activeChannel: action.payload };
        case 'SET_AVAILABLE_EMOTES':
            return { ...state, availableEmotes: action.payload };
        case 'DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL': {
            const updatedCommands = { ...state.availableCommandsChannel };
            if (action.payload && updatedCommands[action.payload]) {
                delete updatedCommands[action.payload];
            }
            return { ...state, availableCommandsChannel: updatedCommands };
        }
        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, action.payload] };
        case 'REMOVE_NOTIFICATION':
            return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        case 'SET_USER_DATA':
            return {
                ...state,
                userDataByChannel: { ...state.userDataByChannel, ...action.payload }
            };
        case 'DELETE_USER_DATA': {
            const updatedUserData = { ...state.userDataByChannel };
            if (updatedUserData[action.payload]) {
                delete updatedUserData[action.payload];
            }
            return { ...state, userDataByChannel: updatedUserData };
        }
        case 'SET_SCROLLED_TO_BOTTOM':
            return { ...state, isScrolledToBottom: action.payload };
        case 'SET_DISPLAYED_LINES':
            return { ...state, displayedLines: action.payload };
        case 'ADD_BUFFERED_LINE':
            return { ...state, bufferedLines: [...state.bufferedLines, action.payload] };
        case 'CLEAR_BUFFERED_LINES':
            return { ...state, bufferedLines: [] };
        case 'PREPEND_LINES':
            return { ...state, displayedLines: [...action.payload, ...state.displayedLines] };
        default:
            console.error("Reducer got invalid action type: " + action.type + "\n - No changes to state were done.");
            return state;
    }
}

const dummyDispatch = () => { };

/** @type {{ state: TerminalState, dispatch: React.Dispatch<TerminalAction>, actions: TerminalActions }} */
const defaultContextValue = {
    state: initialState,
    dispatch: dummyDispatch,
    actions: actions
};

const TerminalContext = createContext(defaultContextValue);

export function TerminalProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <TerminalContext.Provider value={{ state, dispatch, actions }}>
            {children}
        </TerminalContext.Provider>
    );
}

export const useTerminal = () => useContext(TerminalContext);