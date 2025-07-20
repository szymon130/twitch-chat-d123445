import React, { useEffect, useState } from 'react';

const SelfRemovingMessage = ({ user, channel, action, duration = 3000 }) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [isShrinking, setIsShrinking] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Determine message color and icon based on action
    const messageColorClass = action === 'JOIN' ? 'text-green-400' : 'text-red-400';
    const icon = action === 'JOIN' ? '➕' : '➖';
    const actionText = action === 'JOIN' ? 'joined' : 'left';

    useEffect(() => {
        // Start fade-out and slide animation after 'duration' milliseconds
        const fadeOutTimer = setTimeout(() => {
            setIsAnimatingOut(true);
        }, duration);

        // Start shrinking height a bit after fade-out begins (e.g., 500ms into the fade)
        const shrinkTimer = setTimeout(() => {
            setIsShrinking(true);
        }, duration + 500); // Adjust this delay for desired effect

        // Completely remove the component from the DOM after all animations
        const removeComponentTimer = setTimeout(() => {
            setIsVisible(false);
        }, duration + 1000); // Adjust this delay to match total animation time

        // Cleanup timers when the component unmounts or before re-running effect
        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(shrinkTimer);
            clearTimeout(removeComponentTimer);
        };
    }, [duration]); // Re-run effect if duration changes

    if (!isVisible) {
        return null; // Don't render anything if not visible
    }

    // Tailwind CSS classes for animations
    const animationClasses = `
    transition-all duration-500 ease-in-out
    ${isAnimatingOut ? 'translate-x-full opacity-0' : ''}
    ${isShrinking ? 'h-0 py-0 overflow-hidden' : ''}
  `;

    return (
        <div
            className={`whitespace-pre-wrap break-words px-2 py-1 ${messageColorClass} ${animationClasses}`}
        >
            {icon} {user} {actionText} channel #{channel}
        </div>
    );
};


let id = 0;

export default function handleJoinPart({ user, channel, action }, { addMessage }) {
    const message = (icon) => (
        <SelfRemovingMessage
            // icon={icon}
            user={user}
            channel={channel}
            action={action}
        />
    );
    addMessage(action === 'JOIN' ? 'plusone' : 'minusone', message);
}
