// src/hooks/useTerminalActions.js
import { useTerminal } from '../context/TerminalContext';
import JSONViewer from '../components/JSONViewer';
import { useCallback } from 'react';

const accesMap = new Map();
accesMap.set(100, { txt: '<span style="color:  #eeeeeeff;">Everyone</span>', level: 0 });
accesMap.set(250, { txt: '<span style="color:  #54de31ff;">Subscriber</span>', level: 1 });
accesMap.set(300, { txt: '<span style="color:  #317cdeff;">Regular</span>', level: 2 });
accesMap.set(400, { txt: '<span style="color:  #DE3163ff;">Vip</span>', level: 3 });
accesMap.set(500, { txt: '<span style="color:  #deb031ff;">Moderator</span>', level: 4 });
accesMap.set(1000, { txt: '<span style="color: #de5431ff;">Super Moderator</span>', level: 5 });
accesMap.set(1500, { txt: '<span style="color: #de3131ff;">Broadcaster</span>', level: 6 });
accesMap.set("everyone", { txt: '<span style="color:  #858585ff;">Everyone</span>', level: 0 });
accesMap.set("moderator", { txt: '<span style="color:  #deb031ff;">Moderator</span>', level: 4 });
accesMap.set("owner", { txt: '<span style="color: #de3131ff;">Broadcaster</span>', level: 6 });

export default function useTerminalActions(appStateRef) { // Renamed parameter for clarity
    const { state, dispatch, actions } = useTerminal();

    const addMessage = useCallback((type, content, rehydrateType = null, rehydrateData = null, persist = true) => {
        // Use appStateRef.current to get the absolute latest state for buffered/displayed lines
        const currentAppState = appStateRef.current;

        const linePayload = { type, content, persist };
        if (rehydrateType) {
            linePayload.rehydrateType = rehydrateType;
            linePayload.rehydrateData = rehydrateData;
        }

        dispatch({ type: actions.ADD_LINE, payload: linePayload });

        if (currentAppState.isScrolledToBottom) {
            dispatch({
                type: actions.SET_DISPLAYED_LINES,
                payload: [...currentAppState.displayedLines, linePayload, ...currentAppState.bufferedLines]
            });
            dispatch({ type: actions.CLEAR_BUFFERED_LINES });
        } else {
            // Add isBufferedNew flag when message is buffered
            const bufferedPayload = { ...linePayload, isBufferedNew: true };
            dispatch({ type: actions.ADD_BUFFERED_LINE, payload: bufferedPayload });
        }
    }, [appStateRef, dispatch, actions]); // appStateRef is now a dependency instead of state

    const updateCommandsSugestions = (payload) => {
        dispatch({
            type: actions.SET_AVAILABLE_COMMANDS,
            payload: payload
        })
    }

    // Moved handleInputChange definition here, before executeCommand
    const handleInputChange = (value) => {
        dispatch({ type: actions.SET_COMMAND, payload: value });

        if (!value.trim()) {
            dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });
            return;
        }

        const parts = value.split(' ');
        const currentPart = parts[parts.length - 1];
        let matches = [];

        // Channel suggestions (when typing #)
        if (currentPart.startsWith('#') && (parts[0] === '/say' || parts[0] === '/exit')) {
            const channelPrefix = currentPart.substring(1);
            matches = Object.keys(state.availableCommandsChannel)
                .filter(channel => channel.startsWith(channelPrefix))
                .map(channel => `#${channel}`);

            matches = matches.map(cmd => {
                return {
                    cmd: `${cmd}`,
                    properties: false
                }
            });
        }
        else if (currentPart.startsWith(':')) {
            const emotePrefix = currentPart.substring(1).toLowerCase();
            const channel = (parts[1] && parts[1].replace(/#/g, '')) || state.activeChannel;
            const channelEmotes = state.availableEmotes[channel] || [];
            const globalEmotes = state.availableEmotes.global || [];
            const allEmotes = [...channelEmotes, ...globalEmotes];

            matches = allEmotes
                .filter(emote =>
                    emote.code.toLowerCase().includes(emotePrefix)
                )
                .map(emote => ({
                    cmd: `${emote.code}`,
                    properties: { type: 'emote', ...emote }
                }));
        }
        // Channel command suggestions (after channel)
        else if ((currentPart.startsWith('!') && parts.length > 1 && parts[1].startsWith('#'))
            || (currentPart.startsWith('!') && state.activeChannel)
        ) {
            const channel = parts[1]?.substring(1) || state.activeChannel;
            const commandPrefix = currentPart?.substring(1).toLowerCase() || value.toLowerCase();
            console.log(commandPrefix);
            if (state.availableCommandsChannel[channel]) {
                const allCommands = [];

                // Aggregate commands from all platforms
                Object.keys(state.availableCommandsChannel[channel]).forEach(platform => {
                    const commandsPlatform = state.availableCommandsChannel[channel][platform];
                    commandsPlatform.forEach(d => {
                        let commandId, aliases, level, description, color, cost, cooldown;

                        if (platform === 'streamelements') {
                            if (d.enabled === false || !accesMap.get(d.accessLevel)) return;
                            commandId = d.command || d.commandId || false;
                            if (commandId) commandId = `!${commandId}`
                            aliases = d.aliases || [];
                            level = accesMap.get(d.accessLevel).level;
                            description = d.description || d.reply || "";
                            color = "#679fceff";
                            cost = d.cost || 0;
                            cooldown = d.cooldown;
                        } else if (platform === 'nightbot') {
                            if (!accesMap.get(d.userLevel)) return;
                            commandId = d.command || d.name || false;
                            aliases = [];
                            level = accesMap.get(d.userLevel).level;
                            description = d.message || "";
                            color = "#b25edaff";
                        } else if (platform === 'moobot') {
                            if (!d.identifier) return;
                            commandId = d.identifier || false;
                            aliases = [];
                            level = 0;
                            description = d.response || "";
                            color = "#54bc75ff";
                        } else if (platform === 'ttvu') {
                            if (!d.Command || !d.Permissions) return;
                            const perm = d.Permissions.toLowerCase();
                            if (!accesMap.get(perm)) return;
                            commandId = d.Command || false;
                            aliases = [];
                            level = accesMap.get(perm).level;
                            description = d.Description || "";
                            color = "#ff69b4ff";
                        }

                        // Add main command
                        allCommands.push({
                            commandId,
                            aliases,
                            level,
                            description,
                            color,
                            platform,
                            cost: cost || 0,
                            cooldown: cooldown || 0
                        });
                    });
                });

                // Filter commands that match the prefix
                const filteredCommands = allCommands.filter(cmd => {
                    if (cmd.aliases) {
                        for (const alias of cmd.aliases) {
                            return alias.toLowerCase().includes(commandPrefix);
                        }
                    }
                    return cmd.commandId.toLowerCase().includes(commandPrefix) ||
                        currentPart === '!';
                }
                );
                const finalCommands = filteredCommands
                    .filter(Boolean)
                    .sort((a, b) => {
                        if (b.level !== a.level) return a.level - b.level;
                        return a.commandId.localeCompare(b.commandId);
                    });

                matches = finalCommands.map(cmd => {
                    return {
                        cmd: `${cmd.commandId}`,
                        properties: cmd
                    }
                });
            }
        }
        else if (parts.length === 1) {
            matches = Object.keys(state.availableCommands).filter(c => c.startsWith(currentPart));
            matches = matches.map(cmd => {
                return {
                    cmd: `${cmd}`,
                    properties: false
                }
            });
        } else {
            const cmdName = parts[0];
            const cmdDetails = state.availableCommands[cmdName];
            if (cmdDetails?.params && cmdDetails.params.length > 0) {
                matches = cmdDetails.params.filter(p => p.startsWith(currentPart) && !parts.includes(p));
                matches = matches.map(cmd => {
                    return {
                        cmd: `!${cmd}`,
                        properties: false
                    }
                }
                );
            }
        }

        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: matches.length > 0 });
        dispatch({ type: actions.SET_SUGGESTIONS, payload: matches });
        dispatch({ type: actions.SET_ACTIVE_SUGGESTION, payload: 0 });
    };

    const handleFrontendCommand = (cmd, args, wsMethods) => {
        switch (cmd) {
            case '/help':
                const helpText = (
                    <>
                        <h3>Available commands</h3>
                        <ul>
                            {Object.entries(state.availableCommands).map(
                                ([name, { description, params }]) => (
                                    <li key={name}>
                                        <span style={{ color: 'lime' }}>{name.padEnd(12)}</span>
                                        <span style={{ color: 'orange' }}>{params.join(" ")}</span> -
                                        <span style={{ color: 'gray' }}>{` ${description}`}</span>
                                    </li>
                                )
                            )}
                        </ul>
                    </>
                );
                // /help output should not persist
                addMessage('output', helpText, null, null, false); // persist: false
                break;

            case '/clear':
                dispatch({ type: actions.CLEAR_LINES }); // This clears persistent lines
                // "Terminal cleared" message should not persist
                addMessage('system', 'Terminal cleared.', null, null, false); // persist: false
                break;

            case '/refresh':
                document.location.reload();
                break;

            case '/connect':
                if (wsMethods.isConnected) {
                    addMessage('error', 'Already connected.', null, null, false); // persist: false
                } else {
                    addMessage('system', 'Connecting to WebSocket...', null, null, false); // persist: false
                    wsMethods.connect();
                }
                break;

            case '/disconnect':
                if (wsMethods.isConnected) {
                    wsMethods.disconnect();
                } else {
                    addMessage('error', 'Not connected.', null, null, false); // persist: false
                }
                break;

            case '/status':
                const statusText = wsMethods.isConnected ? 'Connected' : 'Disconnected';
                addMessage('system', `Connection status: ${statusText}`, null, null, false); // persist: false
                break;

            case '/debug':
                // /debug output should not persist
                addMessage('output', (icon) => ( // pass function directly, App.js will convert to string placeholder if it needs to persist (but it won't here)
                    <div className="max-h-80 overflow-auto bg-gray-800 p-2 rounded">
                        <JSONViewer data={state} />
                    </div>
                ), null, null, false); // persist: false
                break;


            case '/join':
                if (cmd === "/join" && (args[0] === "@" || args[0] === undefined) && state.activeChannel) {
                    addMessage('join', ` -> [${state.activeChannel}]`); // Simple string message
                    const success = wsMethods.sendMessage({ command: `/join`, payload: `#${state.activeChannel}` });
                    if (!success) {
                        addMessage('error', 'Failed to send message - connection not ready'); // Simple string message
                    }
                    return;
                }

            // eslint-disable-next-line
            case '/say':
                if (args.length > 0 && args[0].startsWith('#')) {
                    const channel = args[0].substring(1);
                    if (typeof channel === 'string')
                        dispatch({ type: actions.SET_ACTIVE_CHANNEL, payload: channel });
                }
            // Fall through to default case to send the message
            default:
                if (wsMethods.isConnected) {
                    const payload = args.join(' ');
                    const success = wsMethods.sendMessage({ command: cmd, payload });
                    if (!success) {
                        addMessage('error', 'Failed to send message - connection not ready'); // Simple string message
                    }
                } else {
                    addMessage('error', `Cannot execute '${cmd}'. Not connected to a server.`); // Simple string message
                }
        }
    };

    const executeCommand = (command, wsMethods) => {
        if (!command.trim()) return;

        // Apply character limit validation
        let charCount = command.length;
        let message = command;

        if (!command.startsWith('/') || command.startsWith('/say')) {
            if (command.startsWith('/say') && state.activeChannel) {
                const prefix = `/say #${state.activeChannel} `;
                if (command.startsWith(prefix)) {
                    message = command.substring(prefix.length);
                    charCount = message.length;
                }
            }

            if (charCount > 500) {
                addMessage('error', `Message exceeds 500 characters (${charCount}/500)`); // Simple string message
                return;
            }
        }

        addMessage('command', command); // Simple string message
        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });

        const [cmd, ...args] = command.trim().split(' ');


        if (Object.keys(state.availableCommands).includes(cmd)) {
            handleFrontendCommand(cmd, args, wsMethods);
        } else if (wsMethods.isConnected) {
            const payload = args.join(' ');

            let success = false;
            if (cmd[0] !== '/' && state.activeChannel) {
                success = wsMethods.sendMessage({ command: `/say`, payload: `#${state.activeChannel} ${command}` });
                if (success) addMessage('system', `TY -> [${state.activeChannel}] ${command}`); // Simple string message
            }
            else success = wsMethods.sendMessage({ command: cmd, payload });
            if (!success) {
                addMessage('error', 'Failed to send command - connection not ready'); // Simple string message
            }
        } else {
            addMessage('error', `Command not found: ${cmd}. Not connected to a server.`);
        }

        dispatch({ type: actions.ADD_TO_HISTORY, payload: command });
        dispatch({ type: actions.SET_COMMAND, payload: '' });
    };


    const addNotification = (notification) => {
        dispatch({ type: actions.ADD_NOTIFICATION, payload: notification });
    };

    return {
        state,
        addMessage, // Return the defined addMessage
        executeCommand,
        handleInputChange, // Now defined earlier
        dispatch, // Also return dispatch as App.js might need it for other actions
        updateCommandsSugestions,
        addNotification
    };
}