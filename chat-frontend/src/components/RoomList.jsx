import React, { useState } from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    TextField,
    Button,
    Paper,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const RoomList = ({ rooms, onRoomSelect, onCreateRoom }) => {
    const [newRoomName, setNewRoomName] = useState('');

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (newRoomName.trim()) {
            onCreateRoom(newRoomName);
            setNewRoomName('');
        }
    };

    return (
        <Paper sx={{
            width: 300,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            p: 2
        }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Chat Rooms</Typography>

            <Box
                component="form"
                onSubmit={handleCreateRoom}
                sx={{ mb: 2 }}
            >
                <TextField
                    fullWidth
                    size="small"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="New room name"
                    sx={{ mb: 1 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    endIcon={<AddIcon />}
                >
                    Create Room
                </Button>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto' }}>
                {rooms.map((room) => (
                    <ListItem
                        button
                        key={room.id}
                        onClick={() => onRoomSelect(room.name)}
                    >
                        <ListItemText primary={room.name} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default RoomList;