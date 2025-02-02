import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatRoom = ({ roomName, onLeaveRoom }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const websocket = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket(`ws://http://127.0.0.1:8000/ws/chat/${roomName}/?token=${localStorage.getItem('token')}`);

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages(prev => [...prev, data]);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocket.current = ws;

        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                const response = await getMessages(roomName);
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        return () => {
            if (websocket.current) {
                websocket.current.close();
            }
        };
    }, [roomName]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && websocket.current) {
            websocket.current.send(JSON.stringify({
                message: newMessage
            }));
            setNewMessage('');
        }
    };

    return (
        <Paper sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 2
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
            }}>
                <Typography variant="h6">{roomName}</Typography>
                <Button onClick={onLeaveRoom} color="primary" variant="outlined">
                    Leave Room
                </Button>
            </Box>

            <Box sx={{
                flex: 1,
                overflow: 'auto',
                mb: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
            }}>
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            p: 1,
                            backgroundColor: 'grey.100',
                            borderRadius: 1
                        }}
                    >
                        <Typography variant="subtitle2" component="span">
                            {message.username || 'Anonymous'}:
                        </Typography>
                        <Typography component="span" sx={{ ml: 1 }}>
                            {message.message || message.content}
                        </Typography>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                    display: 'flex',
                    gap: 1
                }}
            >
                <TextField
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    size="small"
                />
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                >
                    Send
                </Button>
            </Box>
        </Paper>
    );
};

export default ChatRoom;