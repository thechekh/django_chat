import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { getRooms, createRoom } from '../services/api';
import RoomList from '../components/RoomList';
import ChatRoom from '../components/ChatRoom';

const Chat = () => {
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await getRooms();
            setRooms(response.data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    const handleCreateRoom = async (roomName) => {
        try {
            await createRoom(roomName);
            fetchRooms();
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            p: 2,
            gap: 2,
            backgroundColor: 'grey.100'
        }}>
            <RoomList
                rooms={rooms}
                onRoomSelect={setCurrentRoom}
                onCreateRoom={handleCreateRoom}
            />

            {currentRoom ? (
                <Box sx={{ flex: 1 }}>
                    <ChatRoom
                        roomName={currentRoom}
                        onLeaveRoom={() => setCurrentRoom(null)}
                    />
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Typography variant="h6" color="text.secondary">
                        Select a room to start chatting
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default Chat;