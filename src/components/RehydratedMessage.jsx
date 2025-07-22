// src/components/RehydratedMessage.jsx
import { Message } from '../helpers/Message';
import Image from '../helpers/Image';

// Ensure `state` and `dispatch` are passed down for `Message` component's internal logic
const RehydratedMessage = ({ line, dispatch, state, isSelected, isReplyingAccepted }) => {
    const { type, content, rehydrateType, rehydrateData } = line;

    if (rehydrateType === 'user_message_data') {
        const { user, channel, formatted_time, message_part, channel_color, user_color, tags } = rehydrateData;
        return (
            <Message
                user={user} channel={channel} formatted_time={formatted_time}
                message_part={message_part} channel_color={channel_color}
                user_color={user_color} tags={tags} dispatch={dispatch} state={state}
                isSelected={isSelected} // Pass isSelected prop
                isReplyingAccepted={isReplyingAccepted} // Pass isReplyingAccepted prop
            />
        );
    } else if (rehydrateType === 'joined_channels_data') {
        const obj = rehydrateData;
        return (
            <div>
                {obj.map(d => (
                    <div className="ml-3" key={d.channel}>
                        <span>{d.channel}</span>
                        - ACTIVE: <span className={d.isLive === "YES" ? "pl-3 text-green-400" : "text-red-400"}> {d.isLive}</span>
                    </div>
                ))}
            </div>
        );
    } else if (rehydrateType === 'channel_joined_data') {
        const { channel, image } = rehydrateData;
        return (
            <span>
                Joined channel {channel}
                <span className='ml-2'>
                    <Image code={image.code} urls={image.urls} />
                </span>
            </span>
        );
    } else if (rehydrateType === 'channel_exited_data') {
        const { channel, image } = rehydrateData;
        return (
            <span>
                Left channel {channel}
                <span className='ml-2'>
                    <Image code={image.code} urls={image.urls} />
                </span>
            </span>
        );
    } else if (rehydrateType === 'debug_output') {
        // As debug output is highly dynamic and might contain circular refs,
        // it's generally not fully rehydrated from localStorage.
        // The original content in this case would be '[Dynamic Output]' from the persist:false setting
        return content;
    }
    // Fallback for simple string content or directly provided JSX (if any)
    // This will render placeholders for generic JSX or function content after refresh
    return content;
};

export default RehydratedMessage;