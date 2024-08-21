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
    const [tab, setTab] = useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: '',
        receiverName: '',
        connected: false,
        message: ''
    });
    const [userFullNames, setUserFullNames] = useState(new Map());
    const [translations, setTranslations] = useState(new Map()); // State for translations
    const userDetails = useUserDetails();
    const messagesEndRef = useRef(null); // Reference for initial scroll

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
        // Scroll to the bottom on initial load
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [publicChats]);

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

    const onConnected = () => {
        setUserData((prevData) => ({ ...prevData, connected: true }));
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
        userJoin();
    };

    const userJoin = () => {
        const chatMessage = {
            sender: userData.username,
            content: '',
            type: 'JOIN'
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    };

    const onMessageReceived = (payload) => {
        const payloadData = JSON.parse(payload.body);
        if (payloadData.type === "CHAT") {
            setPublicChats(prevChats => [...prevChats, payloadData]);
            fetchUserFullName(payloadData.sender);
        }
    };

    const onPrivateMessage = (payload) => {
        const payloadData = JSON.parse(payload.body);
        setPrivateChats(prevChats => {
            const updatedChats = new Map(prevChats);
            if (!updatedChats.has(payloadData.sender)) {
                updatedChats.set(payloadData.sender, []);
            }
            updatedChats.get(payloadData.sender).push(payloadData);
            return updatedChats;
        });
        fetchUserFullName(payloadData.sender);
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

            // Filter messages with type 'CHAT' and sort by creation date
            const chatMessages = data
                .filter(message => message.type === 'CHAT')
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            console.log('Fetched CHAT messages:', chatMessages);

            // Set the filtered and sorted messages in state
            setPublicChats(chatMessages);

        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchUserFullName = async (username) => {
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

        } catch (error) {
            console.error('Error fetching user full name:', error);
        }
    };

    const handleMessage = (event) => {
        const { value } = event.target;
        setUserData((prevData) => ({ ...prevData, message: value }));
    };

    const sendValue = () => {
        if (stompClient) {
            const chatMessage = {
                sender: userData.username,
                content: userData.message,
                type: 'CHAT'
            };
            stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            setUserData((prevData) => ({ ...prevData, message: '' }));
        }
    };

    const sendPrivateValue = () => {
        if (stompClient) {
            const chatMessage = {
                sender: userData.username,
                receiver: tab,
                content: userData.message,
                type: 'CHAT'
            };
            stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
            setUserData((prevData) => ({ ...prevData, message: '' }));
        }
    };

    const handleUsername = (event) => {
        const { value } = event.target;
        setUserData((prevData) => ({ ...prevData, username: value }));
    };

    const registerUser = () => {
        connect();
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

    

    return (
        <div className="container">
            <Header />
            <div className="chat-card">
                <div className="chat-header">
                    <h3>Conversation</h3>
                </div>
                <div className="chat-body">
                    <ul className="chat-messages">
                        {publicChats.map((message, index) => (
                            <li key={index} className={message.sender === userData.username ? 'message self' : 'message'}>
                                <div className={message.sender === userData.username ? 'avatar self' : 'avatar'}>
                                    {message.sender.charAt(0)}
                                </div>
                                <div className="message-info">
                                    <small className="message-sender">{userFullNames.get(message.sender) || message.sender}</small>
                                    <div className="message-data">
    {message.content}
    <span
        className="translate-link"
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
                            </li>
                        ))}
                        <div ref={messagesEndRef} /> {/* Initial scroll to bottom */}
                    </ul>
                </div>
    
                <div className="chat-footer">
                    <input
                        className="input-message"
                        type="text"
                        value={userData.message}
                        onChange={handleMessage}
                        placeholder="Type a message..."
                    />
                    <button
                        className="send-button"
                        onClick={tab === 'CHATROOM' ? sendValue : sendPrivateValue}
                    >
                        Envoyer
                    </button>
                </div>
            </div>
            
        </div>
    );
    
};
//
export default ChatRoom;
