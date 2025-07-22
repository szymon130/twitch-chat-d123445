// src/fnHandlers/channelJoined.js
import { actions } from '../context/TerminalContext';
// import Image from '../helpers/Image' // No longer needed directly here, handled by RehydratedMessage

export default function handleJoined(data, { addMessage }) {
    // Pass the raw data object for rehydration
    addMessage('system', null, 'channel_joined_data', {
        channel: data,
        image: {
            code: 'peepoClap',
            urls: [
                { size: '1x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/1x.webp' },
                { size: '2x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/2x.webp' },
                { size: '3x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/3x.webp' },
                { size: '4x', url: 'https://cdn.7tv.app/emote/01FVZ57W480001G2Z4KNS5Q12S/4x.webp' },
            ]
        }
    });
}