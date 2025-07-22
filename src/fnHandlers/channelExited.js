// src/fnHandlers/channelExited.js
import { actions } from '../context/TerminalContext';
// import Image from '../helpers/Image' // No longer needed directly here, handled by RehydratedMessage

export default function handleExited(data, { addMessage }) {
    // Pass the raw data object for rehydration
    addMessage('system', null, 'channel_exited_data', {
        channel: data,
        image: {
            code: 'Sadge',
            urls: [
                { size: '1x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/1x.webp' },
                { size: '2x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/2x.webp' },
                { size: '3x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/3x.webp' },
                { size: '4x', url: 'https://cdn.7tv.app/emote/01EZPG1FN80001SNAW00ADK2DY/4x.webp' },
            ]
        }
    });
}