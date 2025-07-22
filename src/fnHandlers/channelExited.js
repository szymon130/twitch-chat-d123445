import { actions } from '../context/TerminalContext';
import Image from '../helpers/Image'

let iNt = 1;
export default function handleExited(data, { addMessage, dispatch, state }) {
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
        Left channel {data}
        <span className='ml-2'>
            <Image
                key={`${data}-${rnd}-${iNt++}`} // Add unique key
                code='Sadge'
                urls={[
                    { size: '1x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/1x.webp' },
                    { size: '2x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/2x.webp' },
                    { size: '3x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/3x.webp' },
                    { size: '4x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/4x.webp' },

                ]}
            />
        </span>
    </span>);
}