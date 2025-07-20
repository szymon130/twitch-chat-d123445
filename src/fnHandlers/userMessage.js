import lightenColor from '../helpers/lightenColor'

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

export default function handleUserMessage(data, { addMessage, state }) {
    /**
     * @type {ChatMessageData}
     */
    const { user, channel, formatted_time, message_part, channel_color, user_color, tags } = data;
    // Check if this is a channel command

    const col = lightenColor(tags.color || user_color, 40);
    const chanCol = lightenColor(channel_color, 40);

    if (data.is_channel_command) {
        addMessage('channel_command', {
            platform: data.platform,
            command: data.command
        });
    } else {
        const message = (icon) => (
            <div id={tags.id} className="relative px-2 pb-1 pt-3" style={{
                borderLeft: state.activeChannel === channel ? '3px solid orange' : '',
                backgroundColor: state.activeChannel === channel ? '#ffa50015' : ''
            }}>
                <div className="text-gray-400 absolute" style={{
                    fontSize: '12px', left: '0.5rem', top: '-2px'
                }}>{formatted_time}
                    <span className="ml-1" style={{ color: chanCol }}>{`#${channel}`}</span>
                </div>
                <span style={{ color: col }}>{`${tags['display-name'] || user}`}</span>: {message_part}
            </div>
        );
        addMessage('message', message);
    }
}
