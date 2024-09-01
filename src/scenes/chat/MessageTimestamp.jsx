import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const MessageTimestamp = ({ timestamp }) => {
    const [showTimestamp, setShowTimestamp] = useState(false);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    return (
        <div className="message-timestamp-container">
            <FontAwesomeIcon 
                icon={faClock} 
                className="clock-icon"
                onClick={() => setShowTimestamp(!showTimestamp)}
            />
            {showTimestamp && (
                <div className="message-timestamp">
                    {formatTimestamp(timestamp)}
                </div>
            )}
        </div>
    );
};

export default MessageTimestamp;
