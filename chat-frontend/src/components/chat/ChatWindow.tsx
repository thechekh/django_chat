import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Paper, Button, Box } from '@mui/material';
import ReactionPicker from './ReactionPicker';
import { Room, Message } from '../../pages/Chat';
import { getCurrentUsername } from '../../utils/auth';

const REACTIONS = ["❤️", "😂", "😮", "😢", "👍"];

export interface ChatWindowProps {
    currentRoom: Room | null;
    messages: Message[];
    onSendMessage: (message: string) => void;
    onReact: (messageId: number, reaction: string) => void;
    joinedRooms: Room[];
    onMarkAsRead: (messageId: number) => void;
}

interface ChatMessageProps {
    msg: Message;
    isMyMessage: boolean;
    currentUsername: string;
    onReact: (messageId: number, reaction: string) => void;
    onMarkAsRead: (messageId: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg, isMyMessage, currentUsername, onReact, onMarkAsRead }) => {
    const messageRef = useRef<HTMLDivElement | null>(null);
    const [hasSentRead, setHasSentRead] = useState(false);

    useEffect(() => {
        if (isMyMessage || hasSentRead) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        onMarkAsRead(msg.id);
                        setHasSentRead(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.01 }
        );

        if (messageRef.current) {
            observer.observe(messageRef.current);
        }
        return () => observer.disconnect();
    }, [isMyMessage, hasSentRead, msg.id, onMarkAsRead]);

    // Determine read status: for sender messages, show one check if no reader, two if at least one has read
    const readStatus = isMyMessage
        ? (msg.read_by && msg.read_by.length > 0 ? "✓✓" : "✓")
        : "";

    return (
        <Box ref={messageRef} display="flex" justifyContent={isMyMessage ? 'flex-end' : 'flex-start'} mb={1}>
            <Paper
                elevation={2}
                sx={{
                    p: 1,
                    borderRadius: '16px',
                    maxWidth: '70%',
                    backgroundColor: '#f1f0f0',
                    cursor: 'context-menu',
                    position: 'relative'
                }}
                onContextMenu={(e) => e.preventDefault()}
            >
                <strong>{isMyMessage ? 'Me' : msg.user}:</strong> {msg.message}
                <Box component="span" sx={{ fontSize: '0.8rem', ml: 1, color: '#555' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                </Box>
                {isMyMessage && (
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 4,
                            bottom: 4,
                            fontSize: '0.75rem',
                            color: '#555'
                        }}
                    >
                        {readStatus}
                    </Box>
                )}
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
};

const ChatWindow: React.FC<ChatWindowProps> = ({
    currentRoom,
    messages,
    onSendMessage,
    onReact,
    joinedRooms,
    onMarkAsRead,
}) => {
    const [newMessage, setNewMessage] = useState<string>('');
    const [reactionAnchor, setReactionAnchor] = useState<HTMLElement | null>(null);
    const [selectedMsgId, setSelectedMsgId] = useState<number | null>(null);

    const currentUsername = getCurrentUsername();

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

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
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
                            {groupedMessages[date].map((msg) => {
                                const isMyMessage = msg.user?.toLowerCase() === currentUsername.toLowerCase();
                                return (
                                    <ChatMessage
                                        key={msg.id}
                                        msg={msg}
                                        isMyMessage={isMyMessage}
                                        currentUsername={currentUsername}
                                        onReact={onReact}
                                        onMarkAsRead={onMarkAsRead}
                                    />
                                );
                            })}
                        </div>
                    ))}
                    <div id="chat-end" />
                </div>
                <div className="card-footer">
                    <Box display="flex" alignItems="center">
                        <input
                            type="text"
                            className="form-control"
                            placeholder={currentRoom && isJoined ? "Type your message..." : "Preview only - join to chat"}
                            value={newMessage}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
                            disabled={!currentRoom || !isJoined}
                        />
                        <Button variant="contained" onClick={handleSend} disabled={!currentRoom || !isJoined} sx={{ ml: 1 }}>
                            Send
                        </Button>
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;