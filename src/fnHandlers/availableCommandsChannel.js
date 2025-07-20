export default function availableCommandsChannel(data, { dispatch, state }) {
  dispatch({
    type: 'SET_AVAILABLE_COMMANDS_CHANNEL',
    payload: {
      ...state.availableCommandsChannel,
      ...data
    }
  });
}