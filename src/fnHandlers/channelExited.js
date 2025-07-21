import { actions } from '../context/TerminalContext';

export default function handleExited(data, { addMessage, dispatch, state }) {
    dispatch({
        type: actions.DELETE_CHANNEL_AVAILABLE_COMMANDS_CHANNEL,
        payload: data
    });

    dispatch({
        type: actions.DELETE_USER_DATA,
        payload: data
    });

    addMessage('system', `Left channel ${data} Sadge`);
}