export default function handleExited(data, { addMessage, dispatch, state }) {
    dispatch({
        type: 'DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL',
        payload: data
    });

    addMessage('system', `Left channel ${data}`);
}