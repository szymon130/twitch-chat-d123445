import { actions } from '../context/TerminalContext';
import Image from '../helpers/Image'

let iNt = 1;
export default function handleJoined(data, { addMessage, dispatch, state }) {
    dispatch({
        type: actions.DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL,
        payload: data
    });

    dispatch({
        type: actions.DELETE_USER_DATA,
        payload: data
    });

    const rnd = parseInt(Math.random() * 10000);
    addMessage('system', <span>
        Joined channel {data}
        <span className='ml-2'>
            <Image
                key={`${data}-${rnd}-${iNt++}`} // Add unique key
                code='peepoClap'
                urls={[
                    { size: '1x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/1x.webp' },
                    { size: '2x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/2x.webp' },
                    { size: '3x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/3x.webp' },
                    { size: '4x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/4x.webp' },

                ]}
            />
        </span>
    </span>);
}