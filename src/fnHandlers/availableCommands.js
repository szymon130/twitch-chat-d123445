import {actions} from '../context/TerminalContext'

export default function availableCommands(data, { dispatch, state }) { // <--- Destructure state from context
    const dataProcessed = {};

    Object.keys(data).forEach(key => {
        dataProcessed[key] = { description: data[key], params: [] }
    });
    

    dispatch({
        type: actions.SET_AVAILABLE_COMMANDS,
        payload: {
            ...state.availableCommands, // Now state is defined
            ...dataProcessed,
        }
    });
}