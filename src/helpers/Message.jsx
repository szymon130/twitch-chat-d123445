import { actions } from '../context/TerminalContext'
import lightenColor from './lightenColor'
import HighlightWords from './HighlightWords'
import Image from './Image'

export const Message = ({ user, channel, formatted_time, message_part, channel_color, user_color, tags, dispatch, addMessage, state }) => {

    const { availableEmotes } = state;
    const userData = state.userDataByChannel[channel];
    
    const renderMessageWithEmotes = (message) => {
        const activeChannel = channel;
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

    const getCurrentCommand = () => {
        return window.__terminalCommandRef || '';
    };

    return (
        <div id={tags.id} className="relative px-2 pb-1 pt-3" style={{
            borderLeft: state.activeChannel === channel ? '3px solid #a970ff' : '',
            backgroundColor: state.activeChannel === channel ? '#a970ff10' : ''
        }}>
            <div className="text-gray-400 absolute" style={{
                fontSize: '12px', left: '0.5rem', top: '-2px'
            }}>{formatted_time}
                <span onClick={() => {
                    dispatch({ type: actions.SET_COMMAND, payload: `/say #${channel} ` });
                }} className="ml-1" style={{ color: lightenColor(channel_color, 40), cursor: 'pointer' }}>
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
            }} style={{ color: lightenColor(tags.color || user_color, 40), cursor: 'pointer' }}>{`${tags['display-name'] || user}`}</span>
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
}