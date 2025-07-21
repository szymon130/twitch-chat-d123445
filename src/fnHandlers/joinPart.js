import React from 'react';

const JoinPartNotification = React.memo(({ user, channel, action }) => {
    return (
        <div className={`p-2 mb-2 rounded-md shadow-lg transition-all duration-300 ${action === 'JOIN'
            ? 'bg-green-900 border border-green-700'
            : 'bg-red-900 border border-red-700'
            }`}>
            <div className="flex items-center">
                <span className="mr-2 text-lg">
                    {action === 'JOIN' ? '➕' : '➖'}
                </span>
                <div>
                    <span className="font-semibold">{user}</span>
                    <span> {action === 'JOIN' ? 'joined' : 'left'} </span>
                    <span className="font-semibold">#{channel}</span>
                </div>
            </div>
        </div>
    );
});

export default function handleJoinPart({ user, channel, action }, { addNotification }) {
    const content = (
        <div className={`p-2 rounded-md shadow-lg ${action === 'JOIN'
                ? 'bg-green-900 border border-green-700'
                : 'bg-red-900 border border-red-700'
            }`}>
            <div className="flex items-center">
                <span className="mr-2 text-lg">
                    {action === 'JOIN' ? '➕' : '➖'}
                </span>
                <div>
                    <span className="font-semibold">{user}</span>
                    <span> {action === 'JOIN' ? 'joined' : 'left'} </span>
                    <span className="font-semibold">#{channel}</span>
                </div>
            </div>
        </div>
    );

    addNotification({
        id: `${Date.now()}-${user}-${channel}`,
        content: content
    });
}