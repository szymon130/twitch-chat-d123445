import lightenColor from '../helpers/lightenColor'

export default function handleUserMessage(data, { addMessage, state }) {
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
            <div className="relative px-2 pb-1 pt-3" style={{
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
