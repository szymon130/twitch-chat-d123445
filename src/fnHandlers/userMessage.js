export default function handleUserMessage(data, { addMessage }) {
    const { user, channel, formatted_time, message_part, channel_color, user_color, tags } = data;
    // Check if this is a channel command
    if (data.is_channel_command) {
        addMessage('channel_command', {
            platform: data.platform,
            command: data.command
        });
    } else {
        const message = () => (
            <div>
                {formatted_time}: <span style={{ color: channel_color }}>{`[${channel}] `}</span>
                <span style={{ color: tags.color || user_color }}>{`<${tags['display-name'] || user}>`}</span>: {message_part}
            </div>
        );
        addMessage('message', message);
    }
}
