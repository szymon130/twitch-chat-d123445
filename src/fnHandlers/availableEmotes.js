import { actions } from '../context/TerminalContext';

export default function availableEmotes(data, { dispatch, state }) {
    dispatch({
        type: actions.SET_AVAILABLE_EMOTES,
        payload: data
    });
}