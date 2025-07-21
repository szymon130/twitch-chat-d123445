import { actions } from '../context/TerminalContext';

export default function userData(data, { dispatch, state }) {
    dispatch({
        type: actions.SET_USER_DATA,
        payload: {
            ...state.userDataByChannel,
            ...data
        }
    });
}