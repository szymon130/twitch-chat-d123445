import { useTerminal } from '../context/TerminalContext';

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

export default function useTerminalActions() {
    const { state, dispatch, actions } = useTerminal();

    const updateCommandsSugestions = (payload) => {
        dispatch({
            type: actions.SET_AVAILABLE_COMMANDS,
            payload: payload
        })
    }

    const addMessage = (type, content) => {
        dispatch({
            type: actions.ADD_LINE,
            payload: { type, content }
        });
    };

    const handleFrontendCommand = (cmd, args, wsMethods) => {
        switch (cmd) {
            case '/help':
                const helpText = Object.entries(state.availableCommands)
                    .map(([name, { description, params }]) =>
                        `${name.padEnd(12)} ${params.join(' ')}\n  ${description}`
                    )
                    .join('\n');
                addMessage('output', `Available Commands:\n${helpText}`);
                break;

            case '/clear':
                dispatch({ type: actions.CLEAR_LINES });
                break;

            case '/refresh':
                document.location.reload();
                break;

            case '/connect':
                if (wsMethods.isConnected) {
                    addMessage('error', 'Already connected.');
                } else {
                    addMessage('system', 'Connecting to WebSocket...');
                    wsMethods.connect();
                }
                break;

            case '/disconnect':
                if (wsMethods.isConnected) {
                    wsMethods.disconnect();
                } else {
                    addMessage('error', 'Not connected.');
                }
                break;

            case '/status':
                const statusText = wsMethods.isConnected ? 'Connected' : 'Disconnected';
                addMessage('system', `Connection status: ${statusText}`);
                break;

            case '/say':
                if (args.length > 0 && args[0].startsWith('#')) {
                    const channel = args[0].substring(1);
                    if (typeof channel === 'string')
                        dispatch({ type: 'SET_ACTIVE_CHANNEL', payload: channel });
                }
            // Fall through to default case to send the message
            default:
                if (wsMethods.isConnected) {
                    const payload = args.join(' ');
                    const success = wsMethods.sendMessage({ command: cmd, payload });
                    if (!success) {
                        addMessage('error', 'Failed to send message - connection not ready');
                    }
                } else {
                    addMessage('error', `Cannot execute '${cmd}'. Not connected to a server.`);
                }
        }
    };

    const executeCommand = (command, wsMethods) => {
        if (!command.trim()) return;

        addMessage('command', command);
        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: false });

        const [cmd, ...args] = command.trim().split(' ');

        if (Object.keys(state.availableCommands).includes(cmd)) {
            handleFrontendCommand(cmd, args, wsMethods);
        } else if (wsMethods.isConnected) {
            const payload = args.join(' ');

            let success = false;

            if (cmd[0] !== '/' && state.activeChannel) {
                success = wsMethods.sendMessage({ command: `/say`, payload: `#${state.activeChannel} ${command}` });
                if (success) addMessage('system', `TY -> [${state.activeChannel}] ${command}`);
            }
            else success = wsMethods.sendMessage({ command: cmd, payload });
            if (!success) {
                addMessage('error', 'Failed to send command - connection not ready');
            }
        } else {
            addMessage('error', `Command not found: ${cmd}. Not connected to a server.`);
        }

        dispatch({ type: actions.ADD_TO_HISTORY, payload: command });
        dispatch({ type: actions.SET_COMMAND, payload: '' });
    };

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
        // Channel command suggestions (after channel)
        else if (currentPart.startsWith('!') && parts.length > 1 && parts[1].startsWith('#')) {
            const channel = parts[1].substring(1);
            const commandPrefix = currentPart.substring(1).toLowerCase();

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
                            commandId = d.command || false;
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

                        // Include aliases in the search pool but don't add them to the list
                        // aliases.forEach(alias => {
                        //     allCommands.push({
                        //         commandId: alias,
                        //         isAlias: true,
                        //         mainCommand: commandId,
                        //         level,
                        //         description,
                        //         color,
                        //         platform,
                        //         cost: cost || 0,
                        //         cooldown: cooldown || 0
                        //     });
                        // });
                    });
                });

                // Filter commands that match the prefix
                const filteredCommands = allCommands.filter(cmd => {
                    if (cmd.aliases) {
                        for (const alias of cmd.aliases) {
                            return alias.toLowerCase().includes(commandPrefix);
                        }
                    }
                    return cmd.commandId.toLowerCase().includes(commandPrefix);
                }
                );

                // Create a map to track which main commands we've already included
                // const includedCommands = new Set();

                // Process commands: include only main commands, but use aliases for matching
                const finalCommands = filteredCommands
                    .filter(Boolean) // Remove any undefined entries
                    .sort((a, b) => {
                        // Sort by access level (descending) then alphabetically
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
        // Existing command suggestions
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
                });
            }
        }

        dispatch({ type: actions.SET_SHOW_SUGGESTIONS, payload: matches.length > 0 });
        dispatch({ type: actions.SET_SUGGESTIONS, payload: matches });
        dispatch({ type: actions.SET_ACTIVE_SUGGESTION, payload: 0 });
    };


    return {
        state,
        addMessage,
        executeCommand,
        handleInputChange,
        dispatch,
        updateCommandsSugestions
    };
}