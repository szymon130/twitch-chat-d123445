// src/fnHandlers/userMessage.js

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


export default function handleUserMessage(data, { addMessage }) {
    data.message_part = data.message_part.replaceAll('\u0001', "");
    // const { user, channel, formatted_time, message_part, channel_color, user_color, tags } = data; // Destructuring not needed directly here

    if (data.is_channel_command) {
        addMessage('channel_command', {
            platform: data.platform,
            command: data.command
        });
    } else {
        if (data.tags['source-room-id'] !== undefined && data.tags['room-id'] !== data.tags['source-room-id']) return;

        // Pass the raw data object for rehydration
        addMessage('output', null, 'user_message_data', data);
    }
}