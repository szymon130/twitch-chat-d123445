export default function availableCommandsChannel(data, { dispatch }) {
  dispatch({
    type: 'SET_AVAILABLE_COMMANDS_CHANNEL',
    payload: data
  });
}