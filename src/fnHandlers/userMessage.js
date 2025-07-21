import lightenColor from '../helpers/lightenColor'
import Image from '../helpers/Image'
import { actions } from '../context/TerminalContext'
import HighlightWords from '../helpers/HighlightWords'


/**
 * Destructured Twitch chat message data.
 *
 * @typedef {Object} ChatTags
 * @property {string} badge-info - Info about user badges (e.g., subscription length).
 * @property {string} badges - Badge types the user has (e.g., subscriber/3).
 * @property {string} client-nonce - Unique message nonce.
 * @property {string} color - Hex color associated with the user.
 * @property {string} display-name - User's display name.
 * @property {string} emotes - Emote IDs used in the message.
 * @property {string} first-msg - Whether this is the user's first message (0 or 1).
 * @property {string} flags - Message flags (e.g., for moderation).
 * @property {string} id - Unique message ID.
 * @property {string} mod - Whether the user is a moderator (0 or 1).
 * @property {string} returning-chatter - Whether the user is a returning chatter (0 or 1).
 * @property {string} room-id - ID of the channel room.
 * @property {string | undefined} source-room-id - ID of the source channel room (In case of connected chats).
 * @property {string} subscriber - Whether the user is a subscriber (0 or 1).
 * @property {string} tmi-sent-ts - Timestamp of message sent (Unix ms).
 * @property {string} turbo - Whether the user has Turbo (deprecated).
 * @property {string} user-id - User ID of the sender.
 * @property {string} user-type - User type (e.g., mod, global_mod, admin, staff).
 */

/**
 * @typedef {Object} ChatMessageData
 * @property {string} user - Username of the sender.
 * @property {string} user_color - Hex color assigned to the user.
 * @property {string} channel_color - Hex color assigned to the channel.
 * @property {string} channel - Channel where the message was sent.
 * @property {string} formatted_time - Formatted timestamp (e.g., YYYY-MM-DD HH:mm:ss).
 * @property {string} message_part - Actual chat message text.
 * @property {ChatTags} tags - Additional metadata about the message and user.
 */


export default function handleUserMessage(data, { addMessage, state, dispatch }) {
    /**
     * @type {ChatMessageData}
    */
    const { availableEmotes } = state;
    data.message_part = data.message_part.replaceAll('\u0001', "");
    const { user, channel, formatted_time, message_part, channel_color, user_color, tags } = data;
    const userData = state.userDataByChannel[channel];
    // Check if this is a channel command

    const col = lightenColor(tags.color || user_color, 40);
    const chanCol = lightenColor(channel_color, 40);

    const renderMessageWithEmotes = (message) => {
        const activeChannel = data.channel;
        const channelEmotes = availableEmotes[activeChannel] || [];
        const globalEmotes = availableEmotes.global || [];
        const allEmotes = [...channelEmotes, ...globalEmotes];


        // Create a map for quick lookup
        const emoteMap = new Map();
        allEmotes.forEach(emote => emoteMap.set(emote.code, emote));
        // Split message into words
        const words = message.split(/\s+/);

        return words.map((word, index) => {
            const emote = emoteMap.get(word);
            if (emote) {
                return (
                    <Image
                        key={`${word}-${index}`} // Add unique key
                        code={emote.code}
                        urls={emote.urls}
                    />
                );
            }
            return <span key={`${word}-${index}`}>{word} </span>; // Wrap in span with key
        });
    };

    if (data.is_channel_command) {
        addMessage('channel_command', {
            platform: data.platform,
            command: data.command
        });
    } else {
        if (tags['source-room-id'] !== undefined && tags['room-id'] !== tags['source-room-id']) return;

        // Create a ref-like function to get the latest command
        const getCurrentCommand = () => {
            return window.__terminalCommandRef || '';
        };
        const message = (icon) => (
            <div id={tags.id} className="relative px-2 pb-1 pt-3" style={{
                borderLeft: state.activeChannel === channel ? '3px solid #a970ff' : '',
                backgroundColor: state.activeChannel === channel ? '#a970ff10' : ''
            }}>
                <div className="text-gray-400 absolute" style={{
                    fontSize: '12px', left: '0.5rem', top: '-2px'
                }}>{formatted_time}
                    <span onClick={() => {
                        dispatch({ type: actions.SET_COMMAND, payload: `/say #${channel} ` });
                    }} className="ml-1" style={{ color: chanCol, cursor: 'pointer' }}>
                        {`#${channel}`}
                        {userData && userData.broadcaster_type && (
                            <span className="ml-1 text-xs text-purple-400">
                                ({userData.broadcaster_type})
                            </span>
                        )}
                    </span>
                </div>
                <span onClick={() => {
                    const currentCommand = getCurrentCommand();
                    const username = `@${tags['display-name'] || user}`;

                    // Check if we're already in a /say command for this channel
                    if (currentCommand.startsWith(`/say #${channel}`)) {
                        // Check if username is already mentioned
                        if (!currentCommand.includes(username)) {
                            dispatch({ type: actions.SET_COMMAND, payload: currentCommand + username + ' ' });
                        }
                    }
                    // If we're in a different channel command, switch to this channel
                    else if (currentCommand.startsWith('/say #')) {
                        dispatch({ type: actions.SET_COMMAND, payload: `/say #${channel} ${username} ` });
                    }
                    // If no channel command, create one
                    else {
                        dispatch({ type: actions.SET_COMMAND, payload: `/say #${channel} ${username} ` });
                    }
                }} style={{ color: col, cursor: 'pointer' }}>{`${tags['display-name'] || user}`}</span>
                : {
                    HighlightWords(
                        {
                            textInput: renderMessageWithEmotes(message_part),
                            wordsToStyle: [/^@?poprostu_szymon_xd$/i],
                            className: 'highlighted'
                        }
                    )

                }
            </div>
        );
        addMessage('message', message);

        dispatch({
            type: actions.ADD_MESSAGE_TO_SAVED,
            payload: {
                id: tags.id,
                timestamp: Date.now(),
                channel,
                user: tags['display-name'] || user,
                message: message_part,
                tags
            }
        });
    }
}