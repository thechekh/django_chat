// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const websocket = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access);
        setToken(data.access);
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const connectToRoom = () => {
    if (roomName && !isConnected && token) {
      // Include token in WebSocket connection
      websocket.current = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/?token=${token}`);

      websocket.current.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      };

      websocket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, data]);
      };

      websocket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      websocket.current.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
      };
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && websocket.current) {
      websocket.current.send(JSON.stringify({
        message: newMessage
      }));
      setNewMessage('');
    }
  };

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  if (!token) {
    return (
      <Box sx={{ maxWidth: 400, margin: '40px auto', p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Login</Typography>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 2 }}>
      {!isConnected ? (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={connectToRoom}
            fullWidth
          >
            Join Room
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem('token');
              setToken(null);
            }}
            fullWidth
            sx={{ mt: 1 }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Typography variant="h6" sx={{ mb: 2 }}>
          Room: {roomName}
        </Typography>
      )}

      {isConnected && (
        <>
          <Box sx={{ mb: 2, height: 400, overflow: 'auto', bgcolor: '#f5f5f5', p: 2 }}>
            {messages.map((message, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography>
                  {message.user}: {message.message}
                </Typography>
              </Box>
            ))}
          </Box>

          <form onSubmit={handleSendMessage}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
              />
              <Button type="submit" variant="contained">
                Send
              </Button>
            </Box>
          </form>
        </>
      )}
    </Box>
  );
}

export default App;