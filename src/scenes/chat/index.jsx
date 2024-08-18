import React, { useEffect, useState, useRef } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useUserDetails from '../../hook/useUserDetails';

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
            // Fetch or update the full name of the sender
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
        // Fetch or update the full name of the sender
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

    return (
        <div className="container">
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
            <style>
    {`
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
        }

        .chat-card {
            width: 800px; /* Increased width */
            height: 90vh; /* Set height to fill the screen minus some space */
            display: flex;
            flex-direction: column;
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            background-color: #ffffff;
            overflow: hidden;
        }

        .chat-header {
            padding: 15px;
            background-color: #e61919; /* Red color */
            color: white;
            text-align: center;
            font-size: 20px;
            border-bottom: 1px solid #ddd;
        }

        .chat-body {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            padding: 15px;
            overflow-y: auto;
            background-color: #f9f9f9;
        }

        .chat-messages {
            list-style-type: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .message {
            display: flex;
            align-items: flex-end; /* Align items to the bottom */
        }

        .message.self {
            justify-content: flex-end;
        }

        .avatar {
            background-color: #d11507;
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0px; /* Margin on both sides */
            font-weight: bold;
        }

        .avatar.self {
            order: 2; /* Move avatar to the right */
            margin-left: 0; /* Remove left margin */
            margin-right: 0; /* Remove right margin */
        }

        .message-info {
            max-width: 70%;
            display: flex;
            flex-direction: column;
            align-items: flex-end; /* Align text to the end for self messages */
        }

        .message-sender {
            font-weight: bold;
            text-align: left;
        }

        .message-data {
            padding: 10px;
            border-radius: 10px;
            background-color: #e9ecef;
            display: inline-block; /* Make message data inline */
        }

        .message.self .message-data {
            background-color: #ff7b5a;
            color: white;
        }

        .chat-footer {
            display: flex;
            align-items: center;
            padding: 15px;
            border-top: 1px solid #ddd;
            background-color: #ffffff;
        }

        .input-message {
            flex-grow: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            margin-right: 10px;
            font-size: 16px;
            line-height: 1.5;
            resize: none;
        }

        .send-button {
            padding: 10px 20px;
            background-color: #e61919; /* Red color */
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 16px;
        }

        .send-button:hover {
            background-color: #c81010; /* Darker red */
        }
    `}
</style>

        </div>
    );
};

export default ChatRoom;
///
