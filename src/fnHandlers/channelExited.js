import { actions } from '../context/TerminalContext';

export default function handleExited(data, { addMessage, dispatch, state }) {
    dispatch({
        type: actions.DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL,
        payload: data
    });

    addMessage('system', `Left channel ${data} Sadge`);
}