export default function availableCommands(data, { dispatch, state }) { // <--- Destructure state from context

    console.log(data)
    const dataProcessed = {};

    Object.keys(data).forEach(key => {
        dataProcessed[key] = { description: data[key], params: [] }
    });

    dispatch({
        type: 'SET_AVAILABLE_COMMANDS',
        payload: {
            ...state.availableCommands, // Now state is defined
            ...dataProcessed,
        }
    });
}