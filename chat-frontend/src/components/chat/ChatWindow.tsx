import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Paper, Button, Box } from '@mui/material';
import ReactionPicker from './ReactionPicker';
import { Room, Message } from '../../pages/Chat';
import { getCurrentUsername } from '../../utils/auth';

const REACTIONS = ["❤️", "😂", "😮", "😢", "👍"];

interface ChatWindowProps {
    currentRoom: Room | null;
    messages: Message[];
    onSendMessage: (message: string) => void;
    onReact: (messageId: number, reaction: string) => void;
    joinedRooms: Room[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    currentRoom,
    messages,
    onSendMessage,
    onReact,
    joinedRooms,
}) => {
    const [newMessage, setNewMessage] = useState<string>('');
    const [reactionAnchor, setReactionAnchor] = useState<HTMLElement | null>(null);
    const [selectedMsgId, setSelectedMsgId] = useState<number | null>(null);

    // Retrieve current username from token.
    const currentUsername = getCurrentUsername();

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const groupMessagesByDate = (msgs: Message[]): { [key: string]: Message[] } => {
        const groups: { [key: string]: Message[] } = {};
        msgs.forEach(msg => {
            const date = new Date(msg.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    const groupedMessages = groupMessagesByDate(messages);
    const isJoined = currentRoom ? joinedRooms.some(r => r.id === currentRoom.id) : false;

    const handleContextMenu = (e: React.MouseEvent<HTMLElement>, msgId: number) => {
        e.preventDefault();
        setReactionAnchor(e.currentTarget);
        setSelectedMsgId(msgId);
    };

    return (
        <div className="col-md-9">
            <ReactionPicker
                anchorEl={reactionAnchor}
                onClose={() => { setReactionAnchor(null); setSelectedMsgId(null); }}
                onSelect={(reaction) => {
                    if (selectedMsgId !== null) onReact(selectedMsgId, reaction);
                }}
            />
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">{currentRoom ? currentRoom.name : 'Select a room'}</h5>
                </div>
                <div className="card-body" style={{ height: '500px', overflowY: 'auto' }}>
                    {Object.keys(groupedMessages).map((date, idx) => (
                        <div key={idx}>
                            <Box my={1} textAlign="center" color="gray">
                                <small>{date}</small>
                            </Box>
                            {groupedMessages[date].map((msg, index) => {
                                // If msg.user matches currentUsername, align right; else align left.
                                const isMyMessage = msg.user?.toLowerCase() === currentUsername.toLowerCase();
                                return (
                                    <Box
                                        key={index}
                                        display="flex"
                                        justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}
                                        mb={1}
                                    >
                                        <Paper
                                            elevation={2}
                                            sx={{
                                                p: 1,
                                                borderRadius: '16px',
                                                maxWidth: '70%',
                                                backgroundColor: '#f1f0f0',
                                                cursor: 'context-menu',
                                            }}
                                            onContextMenu={(e) => handleContextMenu(e, msg.id)}
                                        >
                                            <strong>{isMyMessage ? 'Me' : msg.user}:</strong> {msg.message}
                                            <Box component="span" sx={{ fontSize: '0.8rem', ml: 1, color: '#555' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </Box>
                                            <Box mt={1}>
                                                {REACTIONS.map(emoji => (
                                                    <Button
                                                        key={emoji}
                                                        size="small"
                                                        sx={{ mr: 0.5, minWidth: 'unset' }}
                                                        onClick={() => onReact(msg.id, emoji)}
                                                    >
                                                        {emoji} {msg.reactions && msg.reactions[emoji] ? msg.reactions[emoji] : 0}
                                                    </Button>
                                                ))}
                                            </Box>
                                        </Paper>
                                    </Box>
                                );
                            })}
                        </div>
                    ))}
                    {/* Insert the dummy element here */}
                    <div id="chat-end"/>
            </div>
            <div className="card-footer">
                <Box display="flex" alignItems="center">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={
                            currentRoom && isJoined
                                ? "Type your message..."
                                : "Preview only - join to chat"
                        }
                        value={newMessage}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                        onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
                        disabled={!currentRoom || !isJoined}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSend}
                        disabled={!currentRoom || !isJoined}
                        sx={{ ml: 1 }}
                    >
                        Send
                    </Button>
                </Box>
            </div>
        </div>
        </div >
    );
};

export default ChatWindow;