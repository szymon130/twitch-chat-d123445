export default function handleExited(data, { addMessage }) {
    addMessage('system', `Left channel ${data}`);
}
