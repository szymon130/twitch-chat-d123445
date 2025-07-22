// src/fnHandlers/joinedChannels.js
import { actions } from '../context/TerminalContext';
// import Image from '../helpers/Image' // No longer needed directly here, handled by RehydratedMessage

export default function joinedChannels(obj, { addMessage }) { // obj is the data needed for rehydration
    // Pass the raw data object for rehydration
    addMessage('system', null, 'joined_channels_data', obj);
}