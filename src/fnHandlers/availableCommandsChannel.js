import { actions } from '../context/TerminalContext';

export default function availableCommandsChannel(data, { dispatch, state }) {
  dispatch({
    type: actions.SET_AVAILABLE_COMMANDS_CHANNEL,
    payload: {
      ...state.availableCommandsChannel,
      ...data
    }
  });
}