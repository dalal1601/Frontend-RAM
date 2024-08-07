import { useState, useEffect } from 'react';

const useCurrentUserId = () => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUserIdFromToken = () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                setUserId(decodedToken.sub); // 
            }
        };

        getUserIdFromToken();
    }, []);

    return userId;
};

export default useCurrentUserId;
