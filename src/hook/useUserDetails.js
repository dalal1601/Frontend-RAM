import { useState, useEffect } from 'react';
import useCurrentUserId from './useCurrentUserId';

const useUserDetails = () => {
    const [userDetails, setUserDetails] = useState(null);
    const userId = useCurrentUserId();

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (userId) {
                try {
                    console.log('Fetching user details for ID:', userId); // Debug line
                    const response = await fetch(`http://localhost:8080/User/${userId}`);
                    if (response.ok) {
                        const userData = await response.json();
                        console.log('Fetched user data:', userData); // Debug line
                        setUserDetails(userData);
                    } else {
                        console.error('Failed to fetch user details');
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
        };

        fetchUserDetails();
    }, [userId]);

    return userDetails;
};

export default useUserDetails;
