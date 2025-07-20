export default function handleJoined(data, { addMessage, state }) {
    addMessage('system', `Joined channel ${data}`);
}