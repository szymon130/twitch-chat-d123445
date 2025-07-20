export default function handleJoined(data, { addMessage, state }) {
    console.log(state)
    // No need to modify commands here - they'll be added by availableCommandsChannel
    addMessage('system', `Joined channel ${data}`);
}