export default function handleJoined(data, { addMessage }) {
    console.log(data)
    addMessage('system', `Joined channel ${data}`);
}
