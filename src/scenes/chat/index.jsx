import React, { useEffect, useState, useRef } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useUserDetails from '../../hook/useUserDetails';
import './ChatRoom.css';
import Header from "../../components/Header";
import notificationSound from '../../sounds/notification.mp3';
let stompClient = null;

const ChatRoom = () => {
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab, setTab] = useState(null);
    const [userData, setUserData] = useState({
        username: '',
        receiverId: '',
        connected: false,
        message: ''
    });
    const [userFullNames, setUserFullNames] = useState(new Map());
    const [userAvatars, setUserAvatars] = useState(new Map());
    const [translations, setTranslations] = useState(new Map());
    const [users, setUsers] = useState([]);
    const userDetails = useUserDetails();
    const messagesEndRef = useRef(null);
    const [latestMessageTimestamps, setLatestMessageTimestamps] = useState(new Map());



    useEffect(() => {
        if (userDetails) {
            setUserData((prevData) => ({ ...prevData, username: userDetails.fullname }));
        }
    }, [userDetails]);

    useEffect(() => {
        if (userData.username) {
            connect();
        }
    }, [userData.username]);

    useEffect(() => {
        if (userData.connected) {
            fetchMessages();
        }
    }, [userData.connected]);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [publicChats, privateChats]);
    useEffect(() => {
        if (stompClient) {
            stompClient.connect({}, (frame) => {
                stompClient.subscribe('/topic/public', (message) => {
                    onPublicMessageReceived(message);
                });
            }, (error) => {
                console.error("STOMP error:", error);
            });
        }
    }, [stompClient]);
    
    const onPublicMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
    
        // Update the public chat state///////////////////////////////
        setPublicChats(prevChats => [...prevChats, payloadData]);
    
        // Handle notification for general chat messages
        if (!payloadData.receiverId && tab !== "GENERAL") {
            setUnreadMessages(prev => {
                const updated = new Map(prev);
                const sender = "General Chat";
                if (!updated.has(sender)) {
                    updated.set(sender, []);
                }
                updated.get(sender).push(payloadData);
                return updated;
            });
            playNotificationSound(); // Play notification sound
        }
    };
    
    const connect = () => {
        const token = localStorage.getItem('token');
        const socket = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect(
            { Authorization: `Bearer ${token}` },
            onConnected,
            onError
        );
    };
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [publicChats, privateChats, tab]);
    
    useEffect(() => {
        // Move filtering logic into a separate function
        if (userDetails && users.length > 0) {
            const filteredUsers = filterUsersByRole(users, userDetails.role);
            setUsers(filteredUsers);
        }
    }, [userDetails, users.length]);
    

   
    const onConnected = () => {
        console.log("Connected");
        setUserData((prevData) => ({ ...prevData, connected: true }));
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
        userJoin();
    };

    const userJoin = () => {
        const chatMessage = {
            senderId: userData.username,
            content: '',
            type: 'JOIN'
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    };

    const onMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (payloadData.type === "CHAT") {
            playNotificationSound();
            
            if (payloadData.receiverId && payloadData.receiverId !== userData.username) {
                const sender = payloadData.senderId;
                setUnreadMessages(prev => {
                    const updated = new Map(prev);
                    if (!updated.has(sender)) {
                        updated.set(sender, []);
                    }
                    updated.get(sender).push(payloadData);
                    return updated;
                });
            } else if (!payloadData.receiverId) {
                setPublicChats(prevChats => [...prevChats, payloadData]);
            }
        }
    };
    
    const onPrivateMessage = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (payloadData.type === "CHAT") {
            playNotificationSound(); // Play sound notification
    
            const chatKey = [payloadData.senderId, payloadData.receiverId].sort().join("-");
            if (payloadData.receiverId === userData.username) {
                setUnreadMessages(prev => {
                    const updated = new Map(prev);
                    if (!updated.has(payloadData.senderId)) {
                        updated.set(payloadData.senderId, []);
                    }
                    updated.get(payloadData.senderId).push(payloadData);
                    return updated;
                });
            }
    
            setPrivateChats(prevChats => {
                const updatedChats = new Map(prevChats);
                if (!updatedChats.has(chatKey)) {
                    updatedChats.set(chatKey, []);
                }
                updatedChats.get(chatKey).push(payloadData);
    
                // Update the latest timestamp
                setLatestMessageTimestamps(prevTimestamps => {
                    const updatedTimestamps = new Map(prevTimestamps);
                    updatedTimestamps.set(payloadData.receiverId, payloadData.timestamp);
                    return updatedTimestamps;
                });
    
                return updatedChats;
            });
        }
    };
    
    
    const onError = (err) => {
        console.log(err);
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/messages', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
    
            const chatMessages = data
                .filter(message => message.type === 'CHAT')
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
            const generalMessages = chatMessages.filter(message => !message.receiverId);
            const privateMessages = chatMessages.filter(message => message.receiverId);
    
            setPublicChats(generalMessages);
    
            privateMessages.forEach(message => {
                const key = [message.senderId, message.receiverId].sort().join("-");
                setPrivateChats(prevChats => {
                    const updatedChats = new Map(prevChats);
                    if (!updatedChats.has(key)) {
                        updatedChats.set(key, []);
                    }
                    updatedChats.get(key).push(message);
                    return updatedChats;
                });
    
                // Update latest timestamp for the user
                setLatestTimestamps(prevTimestamps => {
                    const updatedTimestamps = new Map(prevTimestamps);
                    const userId = message.senderId === userData.username ? message.receiverId : message.senderId;
                    if (!updatedTimestamps.has(userId) || new Date(message.timestamp) > new Date(updatedTimestamps.get(userId))) {
                        updatedTimestamps.set(userId, message.timestamp);
                    }
                    console.log('Updated Timestamps:', Array.from(updatedTimestamps.entries())); // Log latest timestamps
                    return updatedTimestamps;
                });
            });
    
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    
    
    
    const [latestTimestamps, setLatestTimestamps] = useState(new Map());

    useEffect(() => {
        if (latestTimestamps.size > 0) {
            fetchAllUsers();
        }
    }, [latestTimestamps]);
    useEffect(() => {
    if (latestTimestamps.size > 0) {
        fetchAllUsers();
    }
}, [latestTimestamps]);

/////////////////////////////////
const fetchAllUsers = async () => {
    try {
        const response = await fetch('http://localhost:8080/User', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Update the latest timestamps for users
        const sortedUsers = data
            .map(user => ({
                ...user,
                latestTimestamp: latestMessageTimestamps.get(user.username) || '1970-01-01T00:00:00.000Z' // Default to a very old date if no timestamp is found
            }))
            .sort((a, b) => new Date(b.latestTimestamp) - new Date(a.latestTimestamp));

        console.log('Sorted Users with Latest Timestamps:', sortedUsers); // Log sorted users with timestamps

        setUsers(sortedUsers);

        const avatars = new Map();
        const fullNames = new Map();
        sortedUsers.forEach(user => {
            avatars.set(user.username, user.avatarUrl);
            fullNames.set(user.username, user.fullname);
        });
        setUserAvatars(avatars);
        setUserFullNames(fullNames);

    } catch (error) {
        console.error('Error fetching users:', error);
    }
};


const filterUsersByRole = (users, role) => {
    switch (role) {
        case 'ADMIN':
            return users;
        case 'AUDITEUR':
            return users.filter(user => user.role === 'ADMIN');
        case 'AUDITE':
            return users.filter(user => user.role === 'ADMIN');
        default:
            return [];
    }
};

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData((prevData) => ({ ...prevData, message: value }));
    };
///////////////////////////////////
const sendValue = () => {
    if (stompClient && stompClient.connected) {
        const chatMessage = {
            senderId: userData.username,
            content: userData.message,
            type: 'CHAT',
            timestamp: new Date().toISOString() // Add timestamp here
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
        setPublicChats(prevChats => [...prevChats, chatMessage]);
        setUserData((prevData) => ({ ...prevData, message: '' }));
    } else {
        console.error("STOMP client not connected");
    }
};

const sendPrivateValue = () => {
    if (stompClient && stompClient.connected && userData.receiverId) {
        const chatMessage = {
            senderId: userData.username,
            receiverId: userData.receiverId,
            content: userData.message,
            type: 'CHAT',
            timestamp: new Date().toISOString() // Add timestamp here
        };
        stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
        setUserData(prevData => ({ ...prevData, message: '' }));
        
        const key = [userData.username, userData.receiverId].sort().join("-");
        setPrivateChats(prevChats => {
            const updatedChats = new Map(prevChats);
            if (!updatedChats.has(key)) {
                updatedChats.set(key, []);
            }
            updatedChats.get(key).push(chatMessage);
            return updatedChats;
        });
    } else {
        console.error("STOMP client not connected or no receiver specified");
    }
};

    

    const handleUserClick = (fullname) => {
        if (fullname === "General Chat") {
            setTab("GENERAL");
        } else {
            setUserData(prevData => ({
                ...prevData,
                receiverId: fullname
            }));
            setTab(fullname);
        }
    };

    const translateMessage = async (message) => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(message)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
    
            // Assuming the response is an array with a single object containing translation_text
            if (Array.isArray(data) && data.length > 0) {
                return data[0].translation_text;
            }
    
            return 'Traduction non disponible';
        } catch (error) {
            console.error('Error translating message:', error);
            return 'Traduction non disponible';
        }
    };

    const handleTranslate = async (message) => {
    try {
        const translation = await translateMessage({
            message: {
                sender: message.sender,
                content: message.content,
                type: message.type
            }
        });

        // Update translation for the specific message ID
        setTranslations(prevTranslations => new Map(prevTranslations).set(message.id, translation || 'Traduction non disponible'));
    } catch (error) {
        console.error('Error translating message:', error);
    }
};

    const getInitials = (fullname) => {
        if (!fullname) return '';
        const names = fullname.split(' ');
        return names.map(name => name.charAt(0)).join('');
    };
    //////////////////////////////////////////////////////
    const [unreadMessages, setUnreadMessages] = useState(new Map());

    const fetchUnreadMessages = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/chat/messages/unread?receiverId=' + userData.username, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const unreadMessagesData = await response.json();
    
            const unreadMap = new Map();
            unreadMessagesData.forEach(msg => {
                const sender = msg.receiverId ? userFullNames.get(msg.senderId) || msg.senderId : "General Chat";
                if (!unreadMap.has(sender)) {
                    unreadMap.set(sender, []);
                }
                unreadMap.get(sender).push(msg);
            });
            setUnreadMessages(unreadMap);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };
    
    // Example function for making the PUT request/////////////////////
    const markMessageAsRead = async (messageId) => {
        if (!messageId) {
            console.error('Invalid message ID.');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:8080/api/chat/messages/${messageId}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
    
            // Remove the message from unreadMessages state
            setUnreadMessages(prev => {
                const updated = new Map(prev);
                updated.forEach((msgs, sender) => {
                    updated.set(sender, msgs.filter(msg => msg.id !== messageId));
                    if (updated.get(sender).length === 0) {
                        updated.delete(sender);
                    }
                });
                return updated;
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    useEffect(() => {
        if (userData.username) {
            fetchUnreadMessages();
        }
    }, [userData.username]);
    
    useEffect(() => {
        if (tab !== "GENERAL") {
            const chatKey = [userData.username, tab].sort().join("-");
            privateChats.get(chatKey)?.forEach(message => {
                if (!message.read && message.id) {
                    markMessageAsRead(message.id);
                }
            });
        }
    }, [tab, privateChats]);   
    const [userInteracted, setUserInteracted] = useState(false); // New state

    const playNotificationSound = () => {
        if (userInteracted || !document.hidden) { // Play sound if user interacted or document is visible
            new Audio(notificationSound).play().catch(error => {
                console.error('Failed to play sound:', error);
            });
        }
    };
    
    useEffect(() => {
        const interaction = localStorage.getItem('userInteracted');
        if (interaction === 'true') {
            setUserInteracted(true);
        }
    
        window.addEventListener('click', handleUserInteraction);
        return () => {
            window.removeEventListener('click', handleUserInteraction);
        };
    }, []);
    
    const handleUserInteraction = () => {
        setUserInteracted(true);
        localStorage.setItem('userInteracted', 'true');
    };
    
    
    

   // console.log('Tab:', tab);
    console.log('Private Chats:', privateChats);
    console.log('Selected Receiver ID:', userData.receiverId);
    const isGeneralChatVisible = userDetails && userDetails.role !== 'AUDITE';
    const getLatestMessageTimestamp = (user) => {
        const chatKey = [userData.username, user.fullname].sort().join("-");
        const messages = privateChats.get(chatKey) || [];
        if (messages.length === 0) return null;
    
        const latestMessage = messages.reduce((latest, message) => {
            const messageTime = new Date(message.timestamp);
            return latest > messageTime ? latest : messageTime;
        }, new Date(0)); // Initialize with the earliest possible date
    
        return latestMessage;
    };
    const sortedUsers = users.slice().sort((a, b) => {
        const timestampA = getLatestMessageTimestamp(a);
        const timestampB = getLatestMessageTimestamp(b);
    
        // Sort by latest message timestamp, with more recent messages coming first
        if (timestampA && timestampB) {
            return timestampB - timestampA;
        }
        if (timestampA) {
            return -1; // `a` comes before `b`
        }
        if (timestampB) {
            return 1; // `b` comes before `a`
        }
        return 0; // No change if both are null
    });
        

    return (
        <div className="chat-room">
            <div className="chat-room-body">
            <div className="chat-sidebar">
    <h3>Users</h3>
    <ul>
        {isGeneralChatVisible && (
            <li onClick={() => handleUserClick("General Chat")}>
                General Chat
                {unreadMessages.has("General Chat") && (
                    <span className="notification-badge">
                        {unreadMessages.get("General Chat").length}
                    </span>
                )}
            </li>
        )}
        {sortedUsers.map((user) => (
    <li key={user.username} onClick={() => handleUserClick(user.fullname)}>
        <div className="avatar">{getInitials(user.fullname)}</div>
        {user.fullname}
        {unreadMessages.has(user.fullname) && (
            <span className="notification-badge">
                {unreadMessages.get(user.fullname).length}
            </span>
        )}
        {privateChats.get([userData.username, user.fullname].sort().join("-"))?.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((message, index) => (
    <span key={index} className="hidden-element">
        {user.fullname === message.receiverId || message.senderId ? 
          (message.timestamp ? new Date(message.timestamp).toLocaleString() : 'No timestamp') 
          : ''}
    </span>
))}

    </li>
))}
    </ul>
</div>

                <div className="chat-content">
                    <div className="chat-room-header">
                        <h1>{tab === "GENERAL" ? "Chat Général" : tab}</h1>
                    </div>
                    <div className="chat-messages">
                        {tab === "GENERAL" && (
                            publicChats.map((message, index) => (
                                <div key={index} className={`chat-message ${message.senderId === userData.username ? 'from-me' : 'from-others'}`}>
                                    <div className="message-header">
                                        <div className="avatar">
                                            {/* Always display initials */}
                                            {getInitials(userFullNames.get(message.senderId) || message.senderId)}
                                        </div>
                                        <strong>{userFullNames.get(message.senderId) || message.senderId}</strong>
                                    </div>
                                    <div className="message-content">
                                        <p>{message.content}</p>
                                        <span
                                            className="translate-button"
                                            onClick={() => handleTranslate(message)}
                                        >
                                            Traduire
                                        </span>
                                        {translations.get(message.id) && (
                                            <div className="translated-message">
                                                <strong>Traduction :</strong> {translations.get(message.id)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                            
                        )}
                        {tab !== "GENERAL" && privateChats.get([userData.username, tab].sort().join("-"))?.map((message, index) => (
    <div
        key={index}
        className={`chat-message ${message.senderId === userData.username ? 'from-me' : 'from-others'}`}
    >
        <div className="message-header">
            <div className="avatar">
                {/* Always display initials */}
                {getInitials(userFullNames.get(message.senderId) || message.senderId)}
            </div>
            <strong>{userFullNames.get(message.senderId) || message.senderId}</strong>
        </div>
        <div className="message-content">
            <p>{message.content}</p>
            <span
                className="translate-button"
                onClick={() => handleTranslate(message)}
            >
                Traduire
            </span>
            {translations.get(message.id) && (
                <div className="translated-message">
                    <strong>Traduction :</strong> {translations.get(message.id)}
                </div>
            )}
        </div>
    </div>
))}

<div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                        {tab === "GENERAL" && (
                            <input
                                type="text"
                                value={userData.message}
                                onChange={handleMessage}
                                onKeyPress={(e) => e.key === 'Enter' ? sendValue() : null}
                                placeholder="Type your message here..."
                            />
                        )}
                        {tab !== "GENERAL" && (
                            <input
                                type="text"
                                value={userData.message}
                                onChange={handleMessage}
                                onKeyPress={(e) => e.key === 'Enter' ? sendPrivateValue() : null}
                                placeholder="Tapez votre message ici..."
                            />
                        )}
                        <button onClick={tab === "GENERAL" ? sendValue : sendPrivateValue}>
                            Envoyer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
