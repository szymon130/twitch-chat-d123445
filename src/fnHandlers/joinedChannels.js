// src/fnHandlers/joinedChannels.js
export default function joinedChannels(obj, { addMessage }) { // obj is the data needed for rehydration
    // Pass the raw data object for rehydration
    addMessage('system', null, 'joined_channels_data', obj, true); // persist: true
}