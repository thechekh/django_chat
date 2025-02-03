import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://127.0.0.1:8000/api";

const Chat = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null); // room object with id and name
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const wsRef = useRef(null);

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchRooms();
    }, [navigate]);

    useEffect(() => {
        if (currentRoom) {
            // Open WebSocket connection using room name
            connectToRoom(currentRoom.name);
            // Also fetch past messages using room id
            fetchMessages(currentRoom.id);
        }
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [currentRoom]);

    const fetchRooms = async () => {
        const token = sessionStorage.getItem('accessToken');
        try {
            const response = await fetch(`${API_BASE_URL}/rooms/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            } else {
                console.error('Failed to fetch rooms');
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const fetchMessages = async (roomId) => {
        const token = sessionStorage.getItem('accessToken');
        try {
            const response = await fetch(`${API_BASE_URL}/messages/?room=${roomId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                // map API messages to fit our display format: use content field and username from serializer
                const formatted = data.map(item => ({
                    ...item,
                    message: item.content,
                    user: item.username || item.user
                }));
                setMessages(formatted);
            } else {
                console.error('Failed to fetch messages');
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const connectToRoom = (roomName) => {
        const token = sessionStorage.getItem('accessToken');
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/?token=${token}`);

        ws.onopen = () => {
            console.log('Connected to chat room:', roomName);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, data]);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        wsRef.current = ws;
    };

    const handleCreateRoom = async () => {
        if (newRoomName.trim()) {
            const token = sessionStorage.getItem('accessToken');
            try {
                const response = await fetch(`${API_BASE_URL}/rooms/`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: newRoomName })
                });
                if (response.ok) {
                    const newRoom = await response.json();
                    setRooms(prev => [...prev, newRoom]);
                    setNewRoomName('');
                } else {
                    console.error("Failed to create room");
                }
            } catch (error) {
                console.error("Error creating room:", error);
            }
        }
    };

    const handleJoinRoom = (room) => {
        setCurrentRoom(room);
        setMessages([]);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && wsRef.current) {
            wsRef.current.send(JSON.stringify({
                message: newMessage,
                room: currentRoom.name
            }));
            setNewMessage('');
        }
    };

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                {/* Chat Rooms List */}
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Chat Rooms</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="New room name"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                />
                                <button
                                    className="btn btn-primary mt-2 w-100"
                                    onClick={handleCreateRoom}
                                >
                                    Create Room
                                </button>
                            </div>
                            <div className="list-group">
                                {rooms.map((room) => (
                                    <button
                                        key={room.id}
                                        className={`list-group-item list-group-item-action ${currentRoom && currentRoom.id === room.id ? 'active' : ''}`}
                                        onClick={() => handleJoinRoom(room)}
                                    >
                                        {room.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-md-9">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">{currentRoom ? currentRoom.name : 'Select a room'}</h5>
                        </div>
                        <div className="card-body" style={{ height: '500px', overflowY: 'auto' }}>
                            {messages.map((msg, index) => (
                                <div key={index} className="mb-2">
                                    <strong>{msg.user}:</strong> {msg.message}
                                </div>
                            ))}
                        </div>
                        <div className="card-footer">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={!currentRoom}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSendMessage}
                                    disabled={!currentRoom}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;