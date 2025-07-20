import lightenColor from '../helpers/lightenColor'
import Image from '../helpers/Image'
import { actions } from '../context/TerminalContext'

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
    const { availableEmotes, command } = state;
    const { user, channel, formatted_time, message_part, channel_color, user_color, tags } = data;
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
                    }} className="ml-1" style={{ color: chanCol, cursor: 'pointer' }}>{`#${channel}`}</span>
                </div>
                <span onClick={() => {
                    if (!command.includes(tags['display-name'] || user)) {
                        if (command.includes(channel))
                            dispatch({ type: actions.SET_COMMAND, payload: command + `@${tags['display-name'] || user} ` });
                        else
                            dispatch({ type: actions.SET_COMMAND, payload: `/say #${channel} @${tags['display-name'] || user} ` });
                    }
                }} style={{ color: col, cursor: 'pointer' }}>{`${tags['display-name'] || user}`}</span>
                : {renderMessageWithEmotes(message_part)}
            </div>
        );
        addMessage('message', message);
    }
}
