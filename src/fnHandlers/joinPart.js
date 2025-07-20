export default function handleJoinPart(data, { addMessage }) {
    const { user, channel, action } = data;
    // const message = `${formatted_time} [${channel}] <${user}>: ${message_part}`;
    // const message = () => (
    //     <div className={action === 'JOIN' ? 'text-green-400' : 'text-red-400'}>
    //         
    //     </div>
    // );
    action === 'JOIN' ?
        addMessage('plusone', `${user} joined channel ${channel}`)
        : addMessage('minusone', `${user} left channel ${channel}`);
}
