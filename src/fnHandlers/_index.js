import handleUserMessage from './userMessage';
import handleJoinPart from './joinPart'
import availableCommands from './availableCommands'
import availableCommandsChannel from './availableCommandsChannel';
import channelJoined from './channelJoined';
import channelExited from './channelExited';
import availableEmotes from './availableEmotes';
import userData from './userData';
import joinedChannels from './joinedChannels';

const fnHandlers = {
    user_message: handleUserMessage,
    join_part: handleJoinPart,
    available_commands: availableCommands,
    available_commands_channel: availableCommandsChannel,
    channel_joined: channelJoined,
    channel_exited: channelExited,
    available_emotes: availableEmotes,
    user_data: userData,
    joined_channels: joinedChannels
    // Add other handlers here as needed
};

// Update to pass addNotification to handlers
export default function handleFnCall(fnName, data, context) {
    const handler = fnHandlers[fnName];
    if (handler) {
        handler(data, {
            ...context,
            addNotification: context.addNotification // Ensure this is passed
        });
        return true;
    }
    return false;
}