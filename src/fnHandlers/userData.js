export default function userData(data, { addMessage }) {
    addMessage('system', `Joined channel ${JSON.stringify(data)}`);
}
