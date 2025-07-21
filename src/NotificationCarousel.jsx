import React, { useState, useEffect, useRef } from 'react';

const NotificationCarousel = ({ notifications, removeNotification }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState('enter');
    const timerRef = useRef(null);

    useEffect(() => {
        // Clear any existing timers when notifications change
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        // If current index is beyond available notifications, reset to 0
        if (currentIndex >= notifications.length) {
            setCurrentIndex(0);
            return;
        }

        // Calculate duration - first 5 get 5s, others get 1s
        const duration = currentIndex < 5 ? 5000 : 1000;

        const showNextNotification = () => {
            // Exit animation for current notification
            setDirection('exit');

            setTimeout(() => {
                // Only remove notification if it still exists
                if (notifications[currentIndex]) {
                    removeNotification(notifications[currentIndex].id);
                }

                // Move to next notification or loop back to start
                if (currentIndex < notifications.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setCurrentIndex(0);
                }

                // Enter animation for next notification
                setDirection('enter');
            }, 300);
        };

        // Set timer for current notification
        timerRef.current = setTimeout(showNextNotification, duration);

        return () => clearTimeout(timerRef.current);
    }, [notifications, currentIndex, removeNotification]);

    if (notifications.length === 0 || currentIndex >= notifications.length) {
        return null;
    }

    const currentNotification = notifications[currentIndex];

    return (
        <div className="fixed top-4 right-4 z-50 w-64">
            <div className={`transition-all duration-300 transform ${direction === 'enter'
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
                }`}>
                {currentNotification.content}
            </div>
        </div>
    );
};

export default NotificationCarousel;