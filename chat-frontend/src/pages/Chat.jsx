import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
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
    }, [navigate]);

    useEffect(() => {
        if (currentRoom) {
            connectToRoom(currentRoom);
        }
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [currentRoom]);

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

    const handleCreateRoom = () => {
        if (newRoomName.trim()) {
            setRooms(prev => [...prev, newRoomName]);
            setNewRoomName('');
        }
    };

    const handleJoinRoom = (roomName) => {
        setCurrentRoom(roomName);
        setMessages([]);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() && wsRef.current) {
            wsRef.current.send(JSON.stringify({
                message: newMessage,
                room: currentRoom
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
                                        key={room}
                                        className={`list-group-item list-group-item-action ${currentRoom === room ? 'active' : ''}`}
                                        onClick={() => handleJoinRoom(room)}
                                    >
                                        {room}
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
                            <h5 className="mb-0">{currentRoom || 'Select a room'}</h5>
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