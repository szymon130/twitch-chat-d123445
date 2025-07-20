// src\context\TerminalContext.js

/**
 * 
 * @typedef {{ type: string, content: string }} TerminalLine
 * 
 * @typedef {{
 *   [key: string]: { description: string, params: string[] }
 * }} AvailableCommands
 * 
 * @typedef {{ name: string | function , description: string }} Suggestion
 *
 * @typedef { { type: 'SET_ACTIVE_CHANNEL', payload: string | null } |{ type: 'ADD_LINE', payload: TerminalLine } | { type: 'SET_COMMAND', payload: string } | { type: 'ADD_TO_HISTORY', payload: string } | { type: 'SET_HISTORY_INDEX', payload: number } | { type: 'SET_AVAILABLE_COMMANDS', payload: AvailableCommands } | { type: 'SET_SUGGESTIONS', payload: Suggestion[] } | { type: 'SET_ACTIVE_SUGGESTION', payload: number } | { type: 'SET_SHOW_SUGGESTIONS', payload: boolean } | { type: 'CLEAR_LINES' } } TerminalAction
 *
 * 
 * @typedef {{
 *   [channel: string]: {
 *     [platform: string]: Array<{
 *       commandId: string,
 *       aliases: string[],
 *       description: string,
 *       // ... other properties
 *     }>
 *   }
 * }} AvailableCommandsChannel
 *
 * @typedef {{
 *   lines: TerminalLine[],
 *   command: string,
 *   commandHistory: string[],
 *   historyIndex: number,
 *   availableCommands: AvailableCommands,
 *   availableCommandsChannel: AvailableCommandsChannel, // NEW
 *   suggestions: Suggestion[],
 *   activeSuggestionIndex: number,
 *   showSuggestions: boolean,
 *   activeChannel: string
 * }} TerminalState
 * 
 * @typedef {{
 *   ADD_LINE: string,
 *   SET_COMMAND: string,
 *   ADD_TO_HISTORY: string,
 *   SET_HISTORY_INDEX: string,
 *   SET_AVAILABLE_COMMANDS: string,
 *   SET_SUGGESTIONS: string,
 *   SET_ACTIVE_SUGGESTION: string,
 *   SET_SHOW_SUGGESTIONS: string,
 *   SET_ACTIVE_CHANNEL: string,
 *   CLEAR_LINES: string,
 *   DELETE_CHANNEL_AVAILABLE_EMOTES_CHANNEL: string,
 *   SET_AVAILABLE_EMOTES: string,
 * }} TerminalActions
 * 
 * @typedef {{
 *   state: TerminalState,
 *   dispatch: React.Dispatch<TerminalAction>,
 *   actions: TerminalActions
 * }} TerminalContextValue
 * 
 * @typedef {Object} Emote
 * @property {string} code - Emote code (e.g., "Kappa")
 * @property {boolean} animated - Whether the emote is animated
 * @property {number} provider - Emote provider ID
 * @property {Array<{size: string, url: string}>} urls - Emote image URLs
 * @property {boolean} zero_width - If emote is zero-width
 * 
 * @typedef {Object} AvailableEmotes
 * @property {Emote[]} global - Global emotes
 * @property {Emote[]} [channelName] - Channel-specific emotes
*/


import React, { createContext, useReducer, useContext } from 'react';

const initialState = {
    lines: [
        { type: 'system', content: 'Terminal initialized. Type "/help" for a list of commands.' }
    ],
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
    activeChannel: null,
    autoConnect: false,
    availableEmotes: {
        global: []
    },
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
};

/**
 * @param {TerminalState} state
 * @param {TerminalAction} action
 * @returns {TerminalState}
 */
function reducer(state, action) {
    switch (action.type) {
        case 'ADD_LINE':
            return { ...state, lines: [...state.lines, action.payload] };

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
            return { ...state, lines: [] };

        case 'SET_AVAILABLE_COMMANDS_CHANNEL':
            // Merge new channel commands with existing ones
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
            return {
                ...state,
                availableEmotes: action.payload
            };

        case 'DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL': {
            // Create a copy of the current state
            const updatedCommands = { ...state.availableCommandsChannel };

            // Remove the specified channel if it exists
            if (action.payload && updatedCommands[action.payload]) {
                delete updatedCommands[action.payload];
            }

            return {
                ...state,
                availableCommandsChannel: updatedCommands
            };
        }

        default:
            console.error("Reducer got invalid action type: " + action.type + "\n - No changes to state were done.");
            return state;
    }
}

/** 
 * @type {React.Dispatch<TerminalAction>} 
 */
const dummyDispatch = () => { };

/** @type {TerminalContextValue} */
const defaultContextValue = {
    state: initialState,
    dispatch: dummyDispatch,  // dummy dispatch function
    actions: actions          // if you have predefined actions
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