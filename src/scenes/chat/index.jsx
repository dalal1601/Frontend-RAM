import React, { useEffect, useState, useRef } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useUserDetails from '../../hook/useUserDetails';
import './ChatRoom.css';
import Header from "../../components/Header";

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
            if (payloadData.receiverId) {
                // Handle private messages
                const key = payloadData.receiverId === userData.username ? payloadData.senderId : payloadData.receiverId;
                setPrivateChats(prevChats => {
                    const updatedChats = new Map(prevChats);
                    if (!updatedChats.has(key)) {
                        updatedChats.set(key, []);
                    }
                    updatedChats.get(key).push(payloadData);
                    return updatedChats;
                });
            } else {
                // Handle public messages for the general chat
                setPublicChats(prevChats => [...prevChats, payloadData]);
                fetchUserDetails(payloadData.senderId);  // Optional: fetch user details if not already available
            }
        }
    };
    

    const onPrivateMessage = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (payloadData.type === "CHAT") {
            const chatKey = [payloadData.senderId, payloadData.receiverId].sort().join("-");
            setPrivateChats(prevChats => {
                const updatedChats = new Map(prevChats);
                if (!updatedChats.has(chatKey)) {
                    updatedChats.set(chatKey, []);
                }
                updatedChats.get(chatKey).push(payloadData);
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
            });

        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
///////////////////////////////
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
        setUsers(data);

        const avatars = new Map();
        const fullNames = new Map();
        data.forEach(user => {
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


    const fetchUserDetails = async (username) => {
        try {
            const response = await fetch(`http://localhost:8080/api/users/${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setUserFullNames(prevNames => new Map(prevNames).set(username, data.fullname));
            setUserAvatars(prevAvatars => new Map(prevAvatars).set(username, data.avatarUrl));
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData((prevData) => ({ ...prevData, message: value }));
    };

    const sendValue = () => {
        if (stompClient && stompClient.connected) {
            const chatMessage = {
                senderId: userData.username,
                content: userData.message,
                type: 'CHAT'
            };
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            
            // Instantly update public chat after sending
            setPublicChats(prevChats => [...prevChats, chatMessage]);
            
            // Clear the message input
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
                type: 'CHAT'
            };
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData(prevData => ({ ...prevData, message: '' }));
            // Update private chat immediately after sending
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
    

    console.log('Tab:', tab);
    console.log('Private Chats:', privateChats);
    console.log('Selected Receiver ID:', userData.receiverId);
    const isGeneralChatVisible = userDetails && userDetails.role !== 'AUDITE';
    

    return (
        <div className="chat-room">
            <div className="chat-room-body">
            <div className="chat-sidebar">
    <h3>Users</h3>
    <ul>
    {isGeneralChatVisible && (
                            <li onClick={() => handleUserClick("General Chat")}>General Chat</li>
                        )}
        {users.map((user) => (
            <li key={user.username} onClick={() => handleUserClick(user.fullname)}>
                <div className="avatar">{getInitials(user.fullname)}</div>
                {user.fullname}
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
